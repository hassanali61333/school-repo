import admin from "firebase-admin";


if (!admin.apps.length) {
  admin.initializeApp({
  "type": "service_account",
  "project_id": "studyproai-b3c02",
  "private_key_id": "ead2dcd09fef1b9f1f37917064a65014d40c1bdd",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDKtWmxEqql3B4/\n+b152Zf1WQp5+PS3h47xsjt0TD7GB6OLs2Kldpx7RBPCPIxicdPYlCe0ZTbjxruP\nwU5CThmk7+CeidhFmcj2FhHPZr2mO3qb5FCA+/C+2EvMwaw31yZOPRiIdaM/o0my\n6johvFdVDsPQQymyOaxIkSqB/nHvTakiBirBlpvz07Z7Prk/9THAASndmkQasWjZ\ngmTtXXZUiVae2SsZXg7t2hcVhNV6/VwcVqdElU6I9a0lHavYHKdNSaDv9DXK7kw9\nwVO/WFupLtYV2uYeGkHA9242O5KnPS9lUDBRI+GHiNIW1lkuqB/qf9yHSf0cW81c\nOYYGtD1rAgMBAAECggEAGEYPYSYQQOqcxWIat4/VZmAND5xpct1s7Mdq3tskfI08\nnzAnehM723eZpXL1B/LZK0BZMtJt92pRr9Ng6N1hAm270vBEcYKKseE5rRbV/fp1\nt7DoQlHTuzQRJknzh/+ftX2+cCokwYGZroQ62tWqtY5I538AwWKuR/BONqEpXpOS\nVjklTesb4wS/7pEoR4Imb9QIPRb5ZsK3qO/MHW/qhjuGKECFozOlO03TbWJ0gnhm\n9u676NoCAXbIB893zish9/kLMxzeFteFzcYw6Bj6cLDHIirUScULb8Nuo/Snlrok\nyCqxEPHSKO7pxooossRfoFdXZOsxQEtP+eoY6ePn3QKBgQDxyg/r645e2SMheYYg\nOSr0jrlv2f8wYwkqZWgD0V1FBphc0MtlUsU5jyEKRJQRX03wz0Y4xVOkqf4m6/Xm\ntrcT+8/aIpTR0/nPNkitldiBP/aRw4hKY8v5GM/o0cZ7EbyU6k4Tblmr3BJ9ZpV2\nO0a8o4dhCm2Iprz80yRx+Ou/PwKBgQDWn1jQD2+oSRfnUGulSVJdtHbjYNgs6hyb\n9H+kd+s1QIso+HReFvm5UAfobpq/05ByuN5Mkw9QJjeJZpiAqqCvSXCVNWWobDo3\nH+0J10GQKrCrWYRHpTCCyvQt+SSKNI6/4tRGAqtQjTcZoA89xLx6fvnAmLoh9RED\n9a3NVqhi1QKBgQC98z46212HyhI9VBk463CBnDa2Vo6SVtt2gSAMD8i0V5APKsD/\notzqcTVFucaRN0wl6NCD/RHPBPVzYmBWliiR/Hu4JP7BMUTJsx25sUTblYKB1RkX\nR/uQgBumDlddi/uZCdG4ljLAPy4Pci3tKnhR7i6G4AhZGJTUEpRJLYMXRQKBgQCh\nKS7LrYuu1pQ4gk8S4qgS7TyJKWOq9nFdOo/OtK3OYxUcQtU/Agmreck2ZDeX7An/\n24ox/gv1p3z0lDHYDEh017TOljYr7nkYg8S/KwB0fVoEkUefdQ+kZzpMe1VQ4n5+\n4Jl9qOtzpVbGy0Ymn+DYKxjn4seCUD/itU05b+UpsQKBgHiUwfL6bFy/lehkQ64z\nau7pv2slxlaD0Bx/NmxNXNUVOE0Mz7Q9jcHjutUSY0VI9tpLUy4sPDnkgq5u2eNc\nRdH7DRi4jzgav8mDlBPc91t0P8kD+aOyMRrFS/J/6mpLmWO6G6ic533Daeq5oORa\nwXIb1K1jHAoQLbFxDzTl3SzV\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@studyproai-b3c02.iam.gserviceaccount.com",
  "client_id": "117209493550242519753",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40studyproai-b3c02.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
);
}

export const db = admin.firestore();
export default admin;