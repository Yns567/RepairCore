<#
  Builds RepairCore, applies database migrations and deploys to Cloud Run.
  Usage (from frontend/):
    .\deploy\gcp-deploy.ps1 -ProjectId my-project [-Region europe-southwest1] [-SiteUrl https://repaircore.ma]
  Leave -SiteUrl empty on the first deploy; re-run with the Cloud Run URL or your domain afterwards.
#>
param(
  [Parameter(Mandatory)] [string] $ProjectId,
  [string] $Region = "europe-southwest1",
  [string] $SqlInstance = "repaircore-db",
  [string] $SiteUrl = ""
)
$ErrorActionPreference = "Stop"
function Invoke-G { & gcloud @args; if ($LASTEXITCODE -ne 0) { throw "gcloud $($args -join ' ') failed" } }

Invoke-G config set project $ProjectId
$bucket = "$ProjectId-product-images"
$image = "$Region-docker.pkg.dev/$ProjectId/repaircore"
$runSa = "repaircore-run@$ProjectId.iam.gserviceaccount.com"
$connection = (& gcloud sql instances describe $SqlInstance --format="value(connectionName)")

Write-Host "==> Building images with Cloud Build"
Invoke-G builds submit --config cloudbuild.yaml `
  --substitutions="_REGION=$Region,_SITE_URL=$SiteUrl,_GCS_BUCKET=$bucket" .

Write-Host "==> Running database migrations"
Invoke-G run jobs deploy repaircore-migrate --image="$image/migrate:latest" --region=$Region `
  --service-account=$runSa --set-cloudsql-instances=$connection `
  --set-secrets="DATABASE_URL=DATABASE_URL:latest" --max-retries=0 --execute-now --wait

Write-Host "==> Deploying web service"
$envVars = "GCS_BUCKET=$bucket,AUTH_TRUST_HOST=true"
if ($SiteUrl) { $envVars += ",AUTH_URL=$SiteUrl,NEXT_PUBLIC_SITE_URL=$SiteUrl" }
Invoke-G run deploy repaircore --image="$image/web:latest" --region=$Region `
  --service-account=$runSa --set-cloudsql-instances=$connection --allow-unauthenticated `
  --memory=1Gi --cpu=1 --min-instances=0 --max-instances=4 --concurrency=80 `
  --set-env-vars=$envVars `
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,AUTH_SECRET=AUTH_SECRET:latest,DATA_ENCRYPTION_KEY=DATA_ENCRYPTION_KEY:latest,NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=NEXT_SERVER_ACTIONS_ENCRYPTION_KEY:latest"

$url = (& gcloud run services describe repaircore --region=$Region --format="value(status.url)")
Write-Host ""
Write-Host "Deployed: $url"
if (-not $SiteUrl) { Write-Host "Re-run with -SiteUrl $url (or your custom domain) so auth callbacks and links use it." }
