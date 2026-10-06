<#
  One-time Google Cloud setup for RepairCore. Safe to re-run: existing resources are kept.
  Usage (from frontend/):
    .\deploy\gcp-setup.ps1 -ProjectId my-project [-Region europe-southwest1] [-DataEncryptionKey <existing key>]

  IMPORTANT: if you migrate existing data, pass the DATA_ENCRYPTION_KEY used in production today,
  otherwise stored IMEI values cannot be decrypted.
#>
param(
  [Parameter(Mandatory)] [string] $ProjectId,
  [string] $Region = "europe-southwest1",
  [string] $SqlInstance = "repaircore-db",
  [string] $DbName = "repair_core",
  [string] $DbUser = "repaircore",
  [string] $DataEncryptionKey = ""
)
$ErrorActionPreference = "Stop"

function Invoke-G { & gcloud @args; if ($LASTEXITCODE -ne 0) { throw "gcloud $($args -join ' ') failed" } }
function Test-G { & gcloud @args *> $null; return $LASTEXITCODE -eq 0 }
function New-Key { $b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b) }
function Set-Secret([string] $Name, [string] $Value) {
  $file = New-TemporaryFile
  try {
    [IO.File]::WriteAllText($file, $Value)
    if (Test-G secrets describe $Name) { Write-Host "Secret $Name exists, keeping it."; return }
    Invoke-G secrets create $Name --replication-policy=automatic --data-file=$file
  } finally { Remove-Item $file -Force }
}

Invoke-G config set project $ProjectId
$projectNumber = (& gcloud projects describe $ProjectId --format="value(projectNumber)")
$bucket = "$ProjectId-product-images"
$runSa = "repaircore-run@$ProjectId.iam.gserviceaccount.com"
$buildSa = "$projectNumber-compute@developer.gserviceaccount.com"

Write-Host "==> Enabling APIs"
Invoke-G services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com `
  cloudbuild.googleapis.com secretmanager.googleapis.com storage.googleapis.com

Write-Host "==> Artifact Registry"
if (-not (Test-G artifacts repositories describe repaircore --location=$Region)) {
  Invoke-G artifacts repositories create repaircore --repository-format=docker --location=$Region
}

Write-Host "==> Cloud SQL (PostgreSQL 16, smallest tier) - this can take ~10 minutes"
if (-not (Test-G sql instances describe $SqlInstance)) {
  Invoke-G sql instances create $SqlInstance --database-version=POSTGRES_16 --edition=ENTERPRISE `
    --tier=db-f1-micro --region=$Region --storage-auto-increase --backup-start-time=03:00
}
if (-not (Test-G sql databases describe $DbName --instance=$SqlInstance)) {
  Invoke-G sql databases create $DbName --instance=$SqlInstance
}
$connection = (& gcloud sql instances describe $SqlInstance --format="value(connectionName)")
if (-not (Test-G secrets describe DATABASE_URL)) {
  $dbPassword = (New-Key) -replace '[^A-Za-z0-9]', ''
  if ((& gcloud sql users list --instance=$SqlInstance --format="value(name)") -contains $DbUser) {
    Invoke-G sql users set-password $DbUser --instance=$SqlInstance --password=$dbPassword
  } else {
    Invoke-G sql users create $DbUser --instance=$SqlInstance --password=$dbPassword
  }
  Set-Secret DATABASE_URL "postgresql://${DbUser}:${dbPassword}@localhost/${DbName}?host=/cloudsql/$connection"
}

Write-Host "==> Cloud Storage bucket for product images (public read)"
if (-not (Test-G storage buckets describe "gs://$bucket")) {
  Invoke-G storage buckets create "gs://$bucket" --location=$Region --uniform-bucket-level-access
  Invoke-G storage buckets add-iam-policy-binding "gs://$bucket" --member=allUsers --role=roles/storage.objectViewer
}

Write-Host "==> Secrets"
Set-Secret AUTH_SECRET (New-Key)
Set-Secret NEXT_SERVER_ACTIONS_ENCRYPTION_KEY (New-Key)
Set-Secret DATA_ENCRYPTION_KEY $(if ($DataEncryptionKey) { $DataEncryptionKey } else { New-Key })

Write-Host "==> Service accounts and permissions"
if (-not (Test-G iam service-accounts describe $runSa)) {
  Invoke-G iam service-accounts create repaircore-run --display-name="RepairCore Cloud Run"
}
foreach ($role in "roles/cloudsql.client", "roles/secretmanager.secretAccessor") {
  Invoke-G projects add-iam-policy-binding $ProjectId --member="serviceAccount:$runSa" --role=$role --condition=None --quiet | Out-Null
}
Invoke-G storage buckets add-iam-policy-binding "gs://$bucket" --member="serviceAccount:$runSa" --role=roles/storage.objectAdmin | Out-Null
foreach ($role in "roles/artifactregistry.writer", "roles/logging.logWriter", "roles/storage.objectViewer") {
  Invoke-G projects add-iam-policy-binding $ProjectId --member="serviceAccount:$buildSa" --role=$role --condition=None --quiet | Out-Null
}
Invoke-G secrets add-iam-policy-binding NEXT_SERVER_ACTIONS_ENCRYPTION_KEY --member="serviceAccount:$buildSa" `
  --role=roles/secretmanager.secretAccessor | Out-Null

Write-Host ""
Write-Host "Setup complete. Next: .\deploy\gcp-deploy.ps1 -ProjectId $ProjectId -Region $Region"
