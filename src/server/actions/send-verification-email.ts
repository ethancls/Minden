"use server";

import { type SendVerificationRequestParams } from "next-auth/providers/email";
import { resend } from "@/server/resend";
import { siteConfig } from "@/config/site";
import { siteUrls } from "@/config/urls";

interface SendVerificationEmailProps {
    params: SendVerificationRequestParams;
}

// Send a verification email to the user
export async function sendVerificationEmail({
    params,
}: SendVerificationEmailProps) {
    try {
        //send email to user via resend
        await resend.emails.send({
            from: siteConfig.noReplyEmail,
            to: params.identifier,
            subject: `Vérifiez votre adresse email | ${siteConfig.name}`,
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Vérifiez votre adresse email</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background: linear-gradient(135deg, #8C52FF 0%, #B57CFF 50%, #7C4DFF 100%);
                            min-height: 100vh;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 40px 20px;
                        }
                        .email-card {
                            background: white;
                            border-radius: 16px;
                            padding: 40px;
                            box-shadow: 0 20px 60px rgba(140, 82, 255, 0.15);
                            text-align: center;
                        }
                        .logo-container {
                            margin-bottom: 32px;
                        }
                        .logo {
                            display: inline-block;
                            text-decoration: none;
                            color: #8C52FF;
                            font-size: 24px;
                            font-weight: bold;
                            align-items: center;
                            gap: 8px;
                        }
                        .logo svg {
                            width: 32px;
                            height: 32px;
                            vertical-align: middle;
                            margin-right: 8px;
                        }
                        h1 {
                            color: #1a1a2e;
                            font-size: 28px;
                            font-weight: 700;
                            margin: 0 0 16px 0;
                            line-height: 1.2;
                        }
                        .subtitle {
                            color: #64748b;
                            font-size: 16px;
                            margin: 0 0 32px 0;
                            line-height: 1.5;
                        }
                        .verify-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #8C52FF, #B57CFF);
                            color: white;
                            text-decoration: none;
                            padding: 16px 32px;
                            border-radius: 12px;
                            font-weight: 600;
                            font-size: 16px;
                            margin: 16px 0 32px 0;
                            box-shadow: 0 8px 24px rgba(140, 82, 255, 0.3);
                            transition: all 0.3s ease;
                        }
                        .verify-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 12px 32px rgba(140, 82, 255, 0.4);
                        }
                        .divider {
                            margin: 32px 0;
                            text-align: center;
                            color: #94a3b8;
                            font-size: 14px;
                        }
                        .divider::before {
                            content: '';
                            display: inline-block;
                            width: 50px;
                            height: 1px;
                            background: #e2e8f0;
                            vertical-align: middle;
                            margin-right: 16px;
                        }
                        .divider::after {
                            content: '';
                            display: inline-block;
                            width: 50px;
                            height: 1px;
                            background: #e2e8f0;
                            vertical-align: middle;
                            margin-left: 16px;
                        }
                        .url-section {
                            background: #f8fafc;
                            border-radius: 12px;
                            padding: 20px;
                            margin: 24px 0;
                            border-left: 4px solid #8C52FF;
                        }
                        .url-text {
                            color: #475569;
                            font-size: 14px;
                            margin-bottom: 12px;
                        }
                        .url {
                            background: white;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 12px;
                            font-family: monospace;
                            font-size: 12px;
                            color: #334155;
                            word-break: break-all;
                        }
                        .footer {
                            margin-top: 40px;
                            padding-top: 32px;
                            border-top: 1px solid #e2e8f0;
                            color: #94a3b8;
                            font-size: 14px;
                            text-align: center;
                        }
                        .security-note {
                            background: #fef3c7;
                            border: 1px solid #fcd34d;
                            border-radius: 8px;
                            padding: 16px;
                            margin: 24px 0;
                            color: #92400e;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="email-card">
                            <div class="logo-container">
                                <a href="${siteUrls.publicUrl}" class="logo">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="523.2 519.2 953.7 956.0">
                                        <g>
                                            <path d="M 730.484375 1042.261719 C 730.484375 1027.210938 748.667969 1019.679688 759.300781 1030.320312 L 769.890625 1040.898438 L 841.46875 1112.480469 C 847.808594 1118.820312 848.050781 1128.960938 842.183594 1135.589844 C 841.953125 1135.851562 841.71875 1136.101562 841.46875 1136.351562 L 759.300781 1218.519531 C 748.667969 1229.148438 730.484375 1221.621094 730.484375 1206.578125 L 730.484375 1042.261719 M 795.84375 1475.171875 L 1240.699219 1030.320312 C 1251.328125 1019.679688 1269.519531 1027.210938 1269.519531 1042.261719 L 1269.519531 1475.171875 L 1476.828125 1475.171875 L 1476.828125 541.738281 C 1476.828125 526.699219 1458.648438 519.171875 1448.011719 529.808594 L 1011.929688 965.890625 C 1011.71875 966.089844 1011.519531 966.289062 1011.308594 966.488281 L 1011.289062 966.511719 C 1004.660156 972.46875 994.4375 972.261719 988.066406 965.890625 L 916.492188 894.308594 L 551.988281 529.808594 C 541.347656 519.171875 523.171875 526.699219 523.171875 541.738281 L 523.171875 1475.171875 L 795.84375 1475.171875" fill="#8C52FF"/>
                                        </g>
                                    </svg>
                                    ${siteConfig.name}
                                </a>
                            </div>
                            
                            <h1>🪄 Votre lien magique</h1>
                            <p class="subtitle">
                                Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et vous connecter à votre compte ${siteConfig.name}.
                            </p>
                            
                            <a href="${params.url}" class="verify-button">
                                Vérifier mon email
                            </a>
                            
                            <div class="divider">ou</div>
                            
                            <div class="url-section">
                                <div class="url-text">
                                    Copiez et collez ce lien dans votre navigateur :
                                </div>
                                <div class="url">${params.url}</div>
                            </div>
                            
                            <div class="security-note">
                                🔒 Ce lien est sécurisé et expire dans 24 heures pour votre protection.
                            </div>
                            
                            <div class="footer">
                                <p>
                                    Si vous n'avez pas demandé cet email, vous pouvez l'ignorer en toute sécurité.
                                </p>
                                <p style="margin-top: 16px;">
                                    Cet email a été envoyé par <strong>${siteConfig.name}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Vérifiez votre adresse email pour ${siteConfig.name}
            
Cliquez sur ce lien pour vérifier votre email et vous connecter : ${params.url}

Si le lien ne fonctionne pas, copiez et collez-le dans votre navigateur.

Si vous n'avez pas demandé cet email, ignorez-le.

Équipe ${siteConfig.name}`,
            tags: [
                {
                    name: "category",
                    value: "confirm_email",
                },
            ],
        });
    } catch (error) {
        throw new Error("Failed to send verification email");
    }
}
