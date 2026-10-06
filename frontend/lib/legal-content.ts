import type { Locale } from "@/lib/i18n/config";

// Legal pages. {email}, {phone}, {city} and {updated} are filled from lib/site.ts.
// This text is a practical starting point, not legal advice: have it reviewed by a Moroccan lawyer.

export type LegalDoc = { title: string; intro: string; sections: { h: string; p: string[] }[] };
export type LegalSlug = "terms" | "refunds" | "privacy";

export const LEGAL: Record<LegalSlug, Record<Locale, LegalDoc>> = {
  terms: {
    en: {
      title: "Terms of Use",
      intro: "These terms govern your use of RepairCore and every purchase made on it. By creating an account or placing an order you accept them. Last updated: {updated}.",
      sections: [
        { h: "1. Who we are", p: ["RepairCore is an online store for mobile repair technicians, operated from {city}, Morocco. Contact: {email} · WhatsApp {phone}."] },
        { h: "2. Your account", p: ["Provide accurate information and keep your password confidential. You are responsible for activity on your account.", "We may suspend an account used for fraud, false payment receipts or abuse of the services."] },
        { h: "3. Products, prices and currencies", p: ["Store products and courses are priced in Moroccan dirhams (MAD). GSM services and software plans are priced in US dollars (USD).", "Prices may change at any time; the price shown when you confirm your order applies. An order is confirmed only if the item is in stock."] },
        { h: "4. Payment and store balance", p: ["You can pay products by cash on delivery or with your store balance. Services, software and courses are paid with the store balance.", "Balance top-ups by bank transfer are credited after we verify the transfer. Your dirham and dollar balances are separate and are never converted automatically.", "The store balance is not a bank account, earns no interest and cannot be transferred to another customer."] },
        { h: "5. Delivery", p: ["We deliver across Morocco. Delivery times are estimates. Please check the package when you receive it and report any problem within 7 days."] },
        { h: "6. GSM services and software", p: ["Services are provided only for devices and accounts you own or are explicitly authorized to service. We do not change IMEI numbers and do not service lost, stolen or blacklisted devices.", "You must provide correct information (IMEI, account username). We may refuse or cancel any request; if it was not processed, the amount is returned to your balance.", "Services are delivered by our team within the estimated time shown on each service."] },
        { h: "7. Prohibited use", p: ["Fraud, fake or altered payment receipts, chargeback abuse or any illegal use lead to account suspension and may be reported to the authorities."] },
        { h: "8. Liability", p: ["We are not responsible for data loss on devices you repair; back up data before any intervention. Our liability for an order is limited to the amount paid for it.", "Nothing in these terms limits your rights as a consumer under Moroccan law No. 31-08."] },
        { h: "9. Changes and applicable law", p: ["We may update these terms; the version published on the site applies to new orders. These terms are governed by Moroccan law. Disputes fall under the competent courts of {city}, without prejudice to the consumer's rights under law No. 31-08."] },
      ],
    },
    ar: {
      title: "شروط الاستخدام",
      intro: "تنظّم هذه الشروط استعمالك لموقع RepairCore وكل عملية شراء تتم عليه. بإنشاء حساب أو إرسال طلب فإنك توافق عليها. آخر تحديث: {updated}.",
      sections: [
        { h: "1. من نحن", p: ["RepairCore متجر إلكتروني لتقنيي إصلاح الهواتف، يُدار من مدينة {city} بالمغرب. للتواصل: {email} · واتساب {phone}."] },
        { h: "2. حسابك", p: ["قدّم معلومات صحيحة وحافظ على سرية كلمة السر. أنت مسؤول عن كل نشاط يتم عبر حسابك.", "يمكننا إيقاف أي حساب يُستعمل في الاحتيال أو في وصولات دفع مزوّرة أو في إساءة استعمال الخدمات."] },
        { h: "3. المنتجات والأسعار والعملات", p: ["منتجات المتجر والدورات بالدرهم المغربي (MAD). خدمات GSM واشتراكات البرامج بالدولار الأمريكي (USD).", "قد تتغير الأسعار في أي وقت؛ ويُعتمد السعر الظاهر عند تأكيد طلبك. لا يُؤكَّد الطلب إلا إذا كان المنتج متوفرًا."] },
        { h: "4. الدفع والرصيد", p: ["يمكنك دفع ثمن المنتجات عند الاستلام أو من رصيدك. الخدمات والبرامج والدورات تُدفع من الرصيد.", "يُضاف شحن الرصيد بالتحويل البنكي بعد التحقق من التحويل. رصيدك بالدرهم ورصيدك بالدولار منفصلان ولا يُحوَّل أحدهما إلى الآخر تلقائيًا.", "الرصيد ليس حسابًا بنكيًا، ولا ينتج فوائد، ولا يمكن تحويله إلى زبون آخر."] },
        { h: "5. التوصيل", p: ["نوصّل إلى كل مدن المغرب. مدد التوصيل تقديرية. افحص الطرد عند استلامه وأبلغنا بأي مشكلة خلال 7 أيام."] },
        { h: "6. خدمات GSM والبرامج", p: ["تُقدَّم الخدمات فقط للأجهزة والحسابات التي تملكها أو المخوّل صراحةً بخدمتها. لا نغيّر أرقام IMEI ولا نخدم الأجهزة الضائعة أو المسروقة أو المحظورة.", "يجب أن تقدّم معلومات صحيحة (IMEI، اسم الحساب). يحق لنا رفض أي طلب أو إلغاؤه؛ وإذا لم يُنفَّذ يرجع المبلغ إلى رصيدك.", "ينفّذ فريقنا الخدمات خلال المدة التقديرية المذكورة في كل خدمة."] },
        { h: "7. الاستعمال الممنوع", p: ["الاحتيال، أو الوصولات المزوّرة أو المعدّلة، أو أي استعمال غير قانوني يؤدي إلى إيقاف الحساب، وقد نبلّغ السلطات المختصة."] },
        { h: "8. المسؤولية", p: ["لسنا مسؤولين عن ضياع البيانات في الأجهزة التي تصلحها؛ احتفظ بنسخة احتياطية قبل أي تدخل. مسؤوليتنا عن أي طلب محدودة في المبلغ المدفوع مقابله.", "لا شيء في هذه الشروط يحدّ من حقوقك كمستهلك بموجب القانون المغربي رقم 31.08."] },
        { h: "9. التعديلات والقانون المطبق", p: ["يمكننا تحديث هذه الشروط، وتُطبَّق النسخة المنشورة على الطلبات الجديدة. تخضع هذه الشروط للقانون المغربي، وتختص بالنزاعات محاكم {city} المختصة، دون المساس بحقوق المستهلك المنصوص عليها في القانون رقم 31.08."] },
      ],
    },
    fr: {
      title: "Conditions d'utilisation",
      intro: "Ces conditions régissent l'utilisation de RepairCore et tout achat effectué sur le site. En créant un compte ou en passant commande, vous les acceptez. Dernière mise à jour : {updated}.",
      sections: [
        { h: "1. Qui sommes-nous", p: ["RepairCore est une boutique en ligne pour les techniciens en réparation mobile, exploitée depuis {city}, Maroc. Contact : {email} · WhatsApp {phone}."] },
        { h: "2. Votre compte", p: ["Fournissez des informations exactes et gardez votre mot de passe confidentiel. Vous êtes responsable de l'activité de votre compte.", "Nous pouvons suspendre un compte utilisé pour une fraude, de faux reçus de paiement ou un abus des services."] },
        { h: "3. Produits, prix et devises", p: ["Les produits de la boutique et les cours sont en dirhams marocains (MAD). Les services GSM et les abonnements logiciels sont en dollars américains (USD).", "Les prix peuvent changer à tout moment ; le prix affiché lors de la confirmation s'applique. Une commande n'est confirmée que si l'article est en stock."] },
        { h: "4. Paiement et solde", p: ["Les produits se paient à la livraison ou avec votre solde. Les services, logiciels et cours se paient avec le solde.", "Les recharges par virement bancaire sont créditées après vérification. Vos soldes en dirhams et en dollars sont distincts et ne sont jamais convertis automatiquement.", "Le solde n'est pas un compte bancaire, ne produit pas d'intérêts et n'est pas transférable à un autre client."] },
        { h: "5. Livraison", p: ["Nous livrons partout au Maroc. Les délais sont indicatifs. Vérifiez le colis à réception et signalez tout problème sous 7 jours."] },
        { h: "6. Services GSM et logiciels", p: ["Les services ne sont fournis que pour des appareils et comptes dont vous êtes propriétaire ou que vous êtes explicitement autorisé à traiter. Nous ne modifions pas les IMEI et ne traitons pas les appareils perdus, volés ou blacklistés.", "Vous devez fournir des informations exactes (IMEI, identifiant). Nous pouvons refuser ou annuler toute demande ; si elle n'a pas été traitée, le montant est recrédité sur votre solde.", "Les services sont réalisés par notre équipe dans le délai indiqué pour chaque service."] },
        { h: "7. Usages interdits", p: ["La fraude, les reçus falsifiés ou tout usage illégal entraînent la suspension du compte et peuvent être signalés aux autorités."] },
        { h: "8. Responsabilité", p: ["Nous ne sommes pas responsables de la perte de données sur les appareils réparés ; sauvegardez avant toute intervention. Notre responsabilité est limitée au montant payé pour la commande.", "Rien dans ces conditions ne limite vos droits de consommateur prévus par la loi marocaine n° 31-08."] },
        { h: "9. Modifications et droit applicable", p: ["Nous pouvons mettre à jour ces conditions ; la version publiée s'applique aux nouvelles commandes. Elles sont régies par le droit marocain. Les litiges relèvent des tribunaux compétents de {city}, sans préjudice des droits du consommateur prévus par la loi n° 31-08."] },
      ],
    },
  },
  refunds: {
    en: {
      title: "Returns & Refund Policy",
      intro: "This policy explains how returns and refunds work at RepairCore. Last updated: {updated}.",
      sections: [
        { h: "1. Physical products: 7-day withdrawal", p: ["In line with law No. 31-08, you can return a product within 7 days of receiving it, without giving a reason. It must be unused, complete and in its original packaging.", "Return shipping costs are paid by the customer, except when the product is defective or not the one ordered."] },
        { h: "2. Defective or wrong products", p: ["Contact us within 7 days of delivery with photos or a video of the problem. We will replace the product or refund it, including delivery costs."] },
        { h: "3. GSM services and software", p: ["A service or software activation that has already been delivered cannot be refunded, because it is consumed immediately. You agree to this when you place the order.", "If a service is rejected, cancelled or cannot be delivered, the full amount is returned to your store balance automatically."] },
        { h: "4. Courses", p: ["A paid course can be refunded on request within 7 days of purchase if you have not substantially used its content."] },
        { h: "5. How refunds are paid", p: ["Refunds are credited to your store balance by default, in the currency you paid in. On request, an eligible refund or unused top-up can be returned by bank transfer within 15 days."] },
        { h: "6. Cash on delivery", p: ["Refusing cash-on-delivery packages repeatedly without a valid reason may lead us to disable cash on delivery for your account."] },
        { h: "7. Contact", p: ["Email {email} or WhatsApp {phone} with your order number."] },
      ],
    },
    ar: {
      title: "سياسة الإرجاع والاسترجاع",
      intro: "توضّح هذه السياسة كيف يتم الإرجاع واسترجاع المبالغ في RepairCore. آخر تحديث: {updated}.",
      sections: [
        { h: "1. المنتجات المادية: حق التراجع خلال 7 أيام", p: ["وفقًا للقانون رقم 31.08، يمكنك إرجاع المنتج خلال 7 أيام من استلامه دون ذكر السبب، بشرط أن يكون غير مستعمل وكاملًا وفي غلافه الأصلي.", "يتحمّل الزبون مصاريف إعادة الشحن، إلا إذا كان المنتج معيبًا أو غير المنتج المطلوب."] },
        { h: "2. المنتجات المعيبة أو الخاطئة", p: ["تواصل معنا خلال 7 أيام من الاستلام مع صور أو فيديو للمشكلة. سنستبدل المنتج أو نرجع ثمنه، بما فيه مصاريف التوصيل."] },
        { h: "3. خدمات GSM والبرامج", p: ["الخدمة أو تفعيل البرنامج الذي تم تسليمه لا يمكن استرجاع ثمنه لأنه يُستهلك فورًا، وأنت توافق على ذلك عند إرسال الطلب.", "إذا رُفضت الخدمة أو أُلغيت أو تعذّر تسليمها، يرجع المبلغ كاملًا إلى رصيدك تلقائيًا."] },
        { h: "4. الدورات", p: ["يمكن استرجاع ثمن الدورة المدفوعة عند الطلب خلال 7 أيام من الشراء إذا لم تستعمل محتواها بشكل كبير."] },
        { h: "5. طريقة الاسترجاع", p: ["يُضاف المبلغ المسترجع إلى رصيدك افتراضيًا وبنفس العملة التي دفعت بها. وعند الطلب، يمكن تحويل المبلغ المستحق أو الرصيد غير المستعمل إلى حسابك البنكي خلال 15 يومًا."] },
        { h: "6. الدفع عند الاستلام", p: ["رفض الطرود المدفوعة عند الاستلام بشكل متكرر دون سبب مقبول قد يؤدي إلى إيقاف خيار الدفع عند الاستلام لحسابك."] },
        { h: "7. التواصل", p: ["راسلنا على {email} أو واتساب {phone} مع رقم طلبك."] },
      ],
    },
    fr: {
      title: "Politique de retour et de remboursement",
      intro: "Cette politique explique le fonctionnement des retours et remboursements chez RepairCore. Dernière mise à jour : {updated}.",
      sections: [
        { h: "1. Produits physiques : rétractation de 7 jours", p: ["Conformément à la loi n° 31-08, vous pouvez retourner un produit dans les 7 jours suivant sa réception, sans justification. Il doit être inutilisé, complet et dans son emballage d'origine.", "Les frais de retour sont à la charge du client, sauf si le produit est défectueux ou non conforme."] },
        { h: "2. Produits défectueux ou erronés", p: ["Contactez-nous dans les 7 jours suivant la livraison avec des photos ou une vidéo du problème. Nous remplacerons ou rembourserons le produit, frais de livraison compris."] },
        { h: "3. Services GSM et logiciels", p: ["Un service ou une activation déjà livré ne peut pas être remboursé, car il est consommé immédiatement. Vous l'acceptez en passant commande.", "Si un service est refusé, annulé ou ne peut être livré, le montant intégral est automatiquement recrédité sur votre solde."] },
        { h: "4. Cours", p: ["Un cours payant peut être remboursé sur demande dans les 7 jours suivant l'achat si son contenu n'a pas été substantiellement utilisé."] },
        { h: "5. Mode de remboursement", p: ["Les remboursements sont crédités sur votre solde par défaut, dans la devise payée. Sur demande, un remboursement éligible ou un solde non utilisé peut être restitué par virement sous 15 jours."] },
        { h: "6. Paiement à la livraison", p: ["Des refus répétés de colis sans motif valable peuvent entraîner la désactivation du paiement à la livraison pour votre compte."] },
        { h: "7. Contact", p: ["Écrivez à {email} ou sur WhatsApp au {phone} en indiquant votre numéro de commande."] },
      ],
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      intro: "RepairCore protects your personal data in line with Moroccan law No. 09-08. This page explains what we collect and why. Last updated: {updated}.",
      sections: [
        { h: "1. Data controller", p: ["RepairCore, {city}, Morocco. Contact for any privacy request: {email}."] },
        { h: "2. Data we collect", p: ["Account: name, email, password (stored only as a secure hash).", "Orders: name, phone, delivery address and city.", "Payments: bank name, transfer reference and the receipt you upload for a top-up.", "GSM services: IMEI (stored encrypted), tool account username and device model.", "Technical: strictly necessary cookies for sign-in, cart and language."] },
        { h: "3. Why we use it", p: ["To process and deliver orders and services, verify payments, provide support, prevent fraud and meet legal and accounting obligations. We do not sell your data and do not use advertising trackers."] },
        { h: "4. Who receives it", p: ["Delivery companies (name, phone, address) and, only when needed to perform a service, the service provider (IMEI or account username).", "Our technical providers for hosting, database and email, which may process data outside Morocco under appropriate safeguards.", "Authorities, when required by law."] },
        { h: "5. How long we keep it", p: ["Account data is kept while your account exists. Order, payment and receipt records are kept for the period required by Moroccan commercial and tax law."] },
        { h: "6. Security", p: ["Passwords are hashed, IMEI numbers are encrypted, connections use HTTPS and only authorized staff can access customer data. Payment receipts are never public."] },
        { h: "7. Your rights", p: ["Under law No. 09-08 you have the right to access, rectify, object to and request deletion of your data. Write to {email}. You can also file a complaint with the CNDP (www.cndp.ma)."] },
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      intro: "يحمي RepairCore معطياتك الشخصية وفقًا للقانون المغربي رقم 09.08. توضّح هذه الصفحة ما نجمعه ولماذا. آخر تحديث: {updated}.",
      sections: [
        { h: "1. المسؤول عن المعالجة", p: ["RepairCore، {city}، المغرب. لأي طلب متعلق بالخصوصية: {email}."] },
        { h: "2. المعطيات التي نجمعها", p: ["الحساب: الاسم، البريد الإلكتروني، كلمة السر (تُحفظ مشفّرة فقط).", "الطلبات: الاسم، الهاتف، عنوان التوصيل والمدينة.", "الدفع: اسم البنك، مرجع التحويل، والوصل الذي ترفعه عند الشحن.", "خدمات GSM: رقم IMEI (يُحفظ مشفّرًا)، اسم الحساب في الأداة، وطراز الجهاز.", "تقنيًا: ملفات تعريف الارتباط الضرورية فقط لتسجيل الدخول والسلة واللغة."] },
        { h: "3. لماذا نستعملها", p: ["لمعالجة الطلبات والخدمات وتسليمها، والتحقق من الدفعات، وتقديم الدعم، ومنع الاحتيال، والوفاء بالالتزامات القانونية والمحاسبية. لا نبيع معطياتك ولا نستعمل أدوات تتبّع إعلانية."] },
        { h: "4. من يتلقّاها", p: ["شركات التوصيل (الاسم، الهاتف، العنوان)، ومزوّد الخدمة فقط عند الحاجة لتنفيذها (IMEI أو اسم الحساب).", "مزوّدونا التقنيون للاستضافة وقاعدة البيانات والبريد، وقد يعالجون المعطيات خارج المغرب مع ضمانات مناسبة.", "السلطات المختصة عندما يفرض القانون ذلك."] },
        { h: "5. مدة الاحتفاظ", p: ["نحتفظ بمعطيات الحساب ما دام حسابك قائمًا. ونحتفظ بسجلات الطلبات والدفعات والوصولات للمدة التي يفرضها القانون التجاري والضريبي المغربي."] },
        { h: "6. الأمان", p: ["كلمات السر مشفّرة، وأرقام IMEI مشفّرة، والاتصال عبر HTTPS، ولا يصل إلى معطيات الزبائن إلا الأشخاص المخوّلون. وصولات الدفع ليست عامة أبدًا."] },
        { h: "7. حقوقك", p: ["بموجب القانون رقم 09.08 لك الحق في الولوج إلى معطياتك وتصحيحها والاعتراض على معالجتها وطلب حذفها. راسلنا على {email}. ويمكنك أيضًا تقديم شكاية إلى اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي (www.cndp.ma)."] },
      ],
    },
    fr: {
      title: "Politique de confidentialité",
      intro: "RepairCore protège vos données personnelles conformément à la loi marocaine n° 09-08. Cette page explique ce que nous collectons et pourquoi. Dernière mise à jour : {updated}.",
      sections: [
        { h: "1. Responsable du traitement", p: ["RepairCore, {city}, Maroc. Pour toute demande liée à vos données : {email}."] },
        { h: "2. Données collectées", p: ["Compte : nom, e-mail, mot de passe (conservé uniquement sous forme chiffrée).", "Commandes : nom, téléphone, adresse de livraison et ville.", "Paiements : banque, référence du virement et reçu téléversé pour une recharge.", "Services GSM : IMEI (chiffré), identifiant du compte outil et modèle d'appareil.", "Technique : cookies strictement nécessaires (connexion, panier, langue)."] },
        { h: "3. Finalités", p: ["Traiter et livrer les commandes et services, vérifier les paiements, assurer le support, prévenir la fraude et respecter nos obligations légales et comptables. Nous ne vendons pas vos données et n'utilisons pas de traceurs publicitaires."] },
        { h: "4. Destinataires", p: ["Les sociétés de livraison (nom, téléphone, adresse) et, uniquement si nécessaire, le prestataire du service (IMEI ou identifiant).", "Nos prestataires techniques d'hébergement, de base de données et d'e-mail, qui peuvent traiter des données hors du Maroc avec des garanties appropriées.", "Les autorités, lorsque la loi l'exige."] },
        { h: "5. Durée de conservation", p: ["Les données du compte sont conservées tant que le compte existe. Les commandes, paiements et reçus sont conservés pendant la durée imposée par la législation commerciale et fiscale marocaine."] },
        { h: "6. Sécurité", p: ["Mots de passe hachés, IMEI chiffrés, connexions HTTPS et accès limité au personnel autorisé. Les reçus de paiement ne sont jamais publics."] },
        { h: "7. Vos droits", p: ["Conformément à la loi n° 09-08, vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression. Écrivez à {email}. Vous pouvez aussi saisir la CNDP (www.cndp.ma)."] },
      ],
    },
  },
};
