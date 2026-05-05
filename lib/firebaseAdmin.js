import admin from "firebase-admin";


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
  "type": "service_account",
  "project_id": "studyproai-b3c02",
  "private_key_id": "1724a08bb0b8c9a0ef078e65c709efb381aac327",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+taeamVaP0nAq\nOzG9uXPQghoX/lsY7kL1YYqtAIy9HnsJ62AsTjNtx98iM4yTwn2ryA7NaLHEI+3B\nMguNR50qlwNzpm1dxAgWL0jts8A5/b2UAGzyO43NZsJ/oJX5VgFRxk5bbUtzRgNo\n+OAJ4elAktSu0IL6BkKeRR/kE7nfyaLvOESkA6EoVGs4QGq74ekZ4HAh21n6UcsS\nJHTkJ1+mYNkLOOp7XiJuwR68bZmfBiYAjVLrjKWB2wvL5LTYo46uARnm579r/qQ+\nNU3qM8SzWZIY2GNy+I8LB/yrG8AfGZc0963axL2VcxruSaZ+CnFMoo/OQ/OKPJK7\nsCLdVlU5AgMBAAECggEAByO61hVWgcThkRstNgqa1NwCCRLrKyhEVnZj4C0sl6nr\n9kebDp2Q3FPGvTuL0D5QQR2YvETmns6viHOMrinXru//X5WD86YynU4A33FCyYj/\nz2oiqgDjwqRNtMR4yOBY5UxUw6R4ViTxXL0wef48or+8eZzxwlV4qf8xffLlGwUb\nQXg1dWgFdQF4OcYnr4Xe1mib8l39YqRbq9pEH5Xr7usImZFK7a4DfBcLriEG1vuX\noD1fV+sZcIz2D9CYvRqiaP0mn14K81iv11oG7Pv3cUoBJ1/MkV1MRrv3xU4wzTgH\nfbF1SD9kKsAD/dXdXDl7aztK1iD1zne50VHr0ND1BwKBgQD+AGclWUb/ttseB0wN\nBwOBTWKWMM1y7xJO1WjjLBQqqU1eB5J3sNYEzbDMKN8VnlLiq18crMzpYjl2ynxl\nSjxUi/BwqkKGe5k4ahLDkKPPlCj1LGRUBvtBr3fBggSZpDtiPtWhmjCZbUtI+inz\nJBQ2pKhf3n53qlx17uh6BcOHIwKBgQDANcW0VKa7u/sTx0UT60bQHEQCbaTOF75U\nuOeaf8dMEIoCfXqtibCijGawQZNRjZE8kW/9dBKzV+GVV4Yy5M+DoNUs3F+yxLcZ\ntV4/HnbsYfk2yWZYcXs6DSA4hgKIJv7lU4X06R9/SKN9qW5NCTfy5kyBR0hIIQhp\nEXaf8scl8wKBgBY6JMyQ5nSkJMKY8t/E+FqNUg5AkQn4v8pkRHx0tAMTs7CByyBs\nOh5Lfagv/22d4DTzuCwDNx9JOCwcBgy7FVJ0uIKzc4TfNgZIygGRG7Sji34A93qe\n7cfOuhUV8p8bTxMG2pz8qDoU5Vyqf5dGVfp+KDnTd4+zOcocMP3UmUqvAoGACWZX\nzdLZ+JJf2/7BxRCbfO/07313MtD8cN4+DVM0ZubkKO0EA9qY9coR94qtbq6SrLic\nFnQHuheRI6GNIY4JC/HgmvoIABEYtzwkaMfPnw3Hh0NgKvEZyqP7sGf1Vb06d/KW\nuXxxGuNtg2a2yzOpNcrHcQcQZN6gr6q392iDDrsCgYBnqOM0p60N0svRnUIbBAx9\nXliPM1LQx10TxCOgMAeiS6J5qWOvBr7+xbDX7HvK59vWQGSNlrvBJhC+UYBFOZPC\nZqnTTWQ6gzlco/lnOavafCDESVuwzhHUSfYXj1RmXuvIaxagPxxvNr+pRL8yrKBP\nLNOmjJyCRZ6NsBPpun0X4w==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@studyproai-b3c02.iam.gserviceaccount.com",
  "client_id": "117209493550242519753",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40studyproai-b3c02.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}),
  });
}

export const db = admin.firestore();
export default admin;