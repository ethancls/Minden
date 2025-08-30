import nodemailer from 'nodemailer';
import { getMany } from '@/lib/settings';

export async function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = await getMany([
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
  ]);
  const host = SMTP_HOST || process.env.SMTP_HOST;
  const port = Number(SMTP_PORT || process.env.SMTP_PORT || 587);
  const user = SMTP_USER || process.env.SMTP_USER || undefined;
  const pass = SMTP_PASSWORD || process.env.SMTP_PASSWORD || undefined;
  if (!host) throw new Error('SMTP_HOST not set');
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: user ? { user, pass } : undefined });
}

type EmailI18n = {
  subjectOtp: string;
  subjectMagic: string;
  hello: string;
  otpIntro: string;
  magicIntro: string;
  magicCta: string;
  magicFallback: string;
  expiresOtp: string;
  footerNote: string;
  visitWebsite: string;
  disclaimer: string;
  securityNote: string;
  helpCenter: string;
};

function emailStrings(locale: string): EmailI18n {
  switch (locale) {
    case 'fr':
      return {
        subjectOtp: 'Votre code de vérification',
        subjectMagic: 'Votre lien de connexion',
        hello: 'Bonjour',
        otpIntro: 'Utilisez ce code pour vérifier votre adresse email.',
        magicIntro: 'Cliquez sur le bouton pour vous connecter à Minden.',
        magicCta: 'Se connecter',
        magicFallback: "Si le bouton ne fonctionne pas, copiez ce lien :",
        expiresOtp: 'Ce code expire dans 10 minutes.',
        footerNote: 'Envoyé par Minden',
        visitWebsite: 'Visiter le site',
        disclaimer: "Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.",
        securityNote: "Nous ne vous demanderons jamais votre mot de passe par email.",
        helpCenter: "Centre d’aide",
      };
    case 'ru':
      return {
        subjectOtp: 'Ваш код подтверждения',
        subjectMagic: 'Ссылка для входа',
        hello: 'Здравствуйте',
        otpIntro: 'Используйте этот код для подтверждения email.',
        magicIntro: 'Нажмите кнопку, чтобы войти в Minden.',
        magicCta: 'Войти',
        magicFallback: 'Если кнопка не работает, скопируйте эту ссылку:',
        expiresOtp: 'Код истекает через 10 минут.',
        footerNote: 'Отправлено Minden',
        visitWebsite: 'Посетить сайт',
        disclaimer: 'Если вы не запрашивали это, просто проигнорируйте это письмо.',
        securityNote: 'Мы никогда не попросим ваш пароль по электронной почте.',
        helpCenter: 'Справочный центр',
      };
    default:
      return {
        subjectOtp: 'Your verification code',
        subjectMagic: 'Your sign-in link',
        hello: 'Hello',
        otpIntro: 'Use this code to verify your email address.',
        magicIntro: 'Click the button to sign in to Minden.',
        magicCta: 'Sign in',
        magicFallback: "If the button doesn't work, copy this link:",
        expiresOtp: 'This code expires in 10 minutes.',
        footerNote: 'Sent by Minden',
        visitWebsite: 'Visit website',
        disclaimer: "If you didn't request this, you can safely ignore this email.",
        securityNote: "We will never ask for your password by email.",
        helpCenter: 'Help Center',
      };
  }
}

function renderEmail({
  locale = 'en',
  title,
  greeting,
  message,
  contentHtml,
  ctaUrl,
  ctaLabel,
}: {
  locale?: string;
  title: string;
  greeting: string;
  message: string;
  contentHtml: string;
  ctaUrl?: string;
  ctaLabel?: string;
}): { html: string; text: string } {
  const site = process.env.NEXTAUTH_URL || 'https://minden.app';
  const help = site.replace(/\/$/, '') + '/help';
  const logo = 'https://minden.app/logo.svg';
  const i18n = emailStrings(locale);
  const footer = i18n.footerNote;
  const button = ctaUrl && ctaLabel
    ? `<tr>
          <td align="left" style="padding:12px 28px 0;">
            <a href="${ctaUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:600">${ctaLabel}</a>
          </td>
        </tr>`
    : '';

  const html = `<!doctype html>
<html lang="${locale}">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <style>
      .bg { background:#f6f7f9; }
      .card { background:#ffffff; border:1px solid #e5e7eb; border-radius:14px; color:#111827; }
      .muted { color:#4b5563; }
      .brand { color:#111827; font-weight:600; font-size:18px; }
      .link { color:#2563eb; text-decoration:none; }
      .footer { color:#6b7280; font-size:12px; }
      @media (prefers-color-scheme: dark) {
        .bg { background:#0b0b0c !important; }
        .card { background:#111214 !important; border-color:#1f2937 !important; color:#e5e7eb !important; }
        .muted { color:#cfd4dc !important; }
        .brand { color:#e5e7eb !important; }
        .link { color:#60a5fa !important; }
        .footer { color:#9aa3af !important; }
      }
    </style>
  </head>
  <body class="bg" style="margin:0;padding:0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:32px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="card">
          <tr>
            <td align="left" style="padding:28px 28px 0;">
              <div style="display:flex;align-items:center;gap:10px;">
                <img src="${logo}" width="36" height="36" alt="Minden" style="display:block;"/>
                <span class="brand">Minden</span>
              </div>
            </td>
          </tr>
          <tr><td style="padding:18px 28px 0;font-size:20px;line-height:28px;font-weight:700;">${title}</td></tr>
          <tr><td class="muted" style="padding:10px 28px 0;font-size:14px;line-height:22px;">${greeting}<br/>${message}</td></tr>
          ${button}
          <tr><td style="padding:20px 28px 28px">${contentHtml}</td></tr>
          <tr>
            <td class="footer" style="padding:18px 28px;border-top:1px solid #e5e7eb;">
              <div>${i18n.disclaimer}</div>
              <div style="margin-top:6px;">${i18n.securityNote}</div>
              <div style="margin-top:8px;">${footer} • <a href="${site}" class="link">${i18n.visitWebsite}</a> • <a href="${help}" class="link">${i18n.helpCenter}</a></div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const textFooter = `${i18n.disclaimer}\n${i18n.securityNote}\n${footer} • ${i18n.visitWebsite}: ${site} • ${i18n.helpCenter}: ${help}`;
  const text = `${title}\n\n${greeting}\n${message}\n\n` + (ctaUrl ? `${ctaLabel}: ${ctaUrl}\n\n` : '') + contentHtml.replace(/<[^>]+>/g, '') + `\n\n${textFooter}`;
  return { html, text };
}

export async function sendOtpEmail(to: string, code: string, locale: string = 'en') {
  const { SMTP_FROM } = await getMany(['SMTP_FROM']);
  const from = SMTP_FROM || process.env.SMTP_FROM || 'Minden <no-reply@minden.local>';
  const i18n = emailStrings(locale);
  const content = `<div style="text-align:center;margin-top:6px"><div style="display:inline-block;background:#2563eb;color:#fff;border-radius:10px;padding:12px 18px;font-size:24px;letter-spacing:4px;font-weight:800;">${code}</div><div style="margin-top:10px;color:#6b7280;font-size:12px;">${i18n.expiresOtp}</div></div>`;
  const { html, text } = renderEmail({ locale, title: i18n.subjectOtp, greeting: `${i18n.hello},`, message: i18n.otpIntro, contentHtml: content });
  const transporter = await getTransport();
  await transporter.sendMail({ from, to, subject: i18n.subjectOtp, html, text });
}

export async function sendMagicLinkEmail(to: string, url: string, locale: string = 'en') {
  const { SMTP_FROM } = await getMany(['SMTP_FROM']);
  const from = SMTP_FROM || process.env.SMTP_FROM || 'Minden <no-reply@minden.local>';
  const i18n = emailStrings(locale);
  const { html, text } = renderEmail({
    locale,
    title: i18n.subjectMagic,
    greeting: `${i18n.hello},`,
    message: i18n.magicIntro,
    contentHtml: `<div style="font-size:12px;color:#6b7280;">${i18n.magicFallback}<br/><a href="${url}" style="color:#2563eb;word-break:break-all;">${url}</a></div>`,
    ctaUrl: url,
    ctaLabel: i18n.magicCta,
  });
  const transporter = await getTransport();
  await transporter.sendMail({ from, to, subject: i18n.subjectMagic, html, text });
}

export function guessLocaleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const cb = u.searchParams.get('callbackUrl');
    if (cb) {
      const p = new URL(cb, url);
      const seg = p.pathname.split('/').filter(Boolean)[0];
      if (seg && ['en', 'fr', 'ru'].includes(seg)) return seg;
    }
  } catch {}
  return 'en';
}
