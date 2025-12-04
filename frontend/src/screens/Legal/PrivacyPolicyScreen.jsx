/**
 * PrivacyPolicyScreen
 * Privacy Policy in English and French
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import theme from '../../theme';
import { useTranslation } from '../../../hooks/useTranslation';

const translations = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: December 4, 2025',
    sections: {
      intro: {
        title: '1. Introduction',
        content: 'Focus Health & Services ("we", "our", "us") operates the Focus Health Academy mobile application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. We are committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR) and applicable French data protection laws.',
      },
      dataController: {
        title: '2. Data Controller',
        content: 'Focus Health & Services\n14 Rue de Lattre de Tassigny\n67300 Schiltigheim, Strasbourg\nFrance\n\nContact: contact@focushealth-services.fr\nSupport: support@focushealth-academy.com',
      },
      dataCollection: {
        title: '3. Information We Collect',
        content: 'We collect the following types of information:\n\n• Personal Information: Name, email address, password (encrypted)\n• Profile Information: Profile picture, phone number (optional)\n• Course Data: Enrollment records, course progress, lesson completion status, certificates earned\n• Payment Information: Transaction history, payment amounts, currency (payment card details are processed securely by Stripe and not stored on our servers)\n• Event Registrations: Event attendance records, registration dates, QR codes for in-person events\n• User Activity: Timeline posts, comments, and interactions within the application\n• Technical Data: Device information, IP address, app usage statistics',
      },
      legalBasis: {
        title: '4. Legal Basis for Processing (GDPR)',
        content: 'We process your personal data based on:\n\n• Contract Performance: To provide courses and services you purchased\n• Consent: For optional features like profile pictures and timeline posts\n• Legitimate Interest: To improve our services, prevent fraud, and ensure security\n• Legal Obligation: To comply with financial and tax regulations',
      },
      dataUse: {
        title: '5. How We Use Your Information',
        content: 'We use your information to:\n\n• Provide access to purchased courses and events\n• Process payments and send purchase confirmations\n• Track your learning progress and issue certificates\n• Send transactional emails (welcome, purchase confirmations, password resets, certificates)\n• Generate QR codes for in-person event check-ins\n• Maintain and improve application functionality\n• Ensure security and prevent unauthorized access\n• Comply with legal obligations',
      },
      dataSharing: {
        title: '6. Data Sharing and Third Parties',
        content: 'We do not sell or share your personal data with third parties for marketing purposes. We only share data with:\n\n• Stripe: For secure payment processing (subject to Stripe\'s privacy policy)\n• Email Service Provider: Namecheap Private Email for transactional emails\n• Cloud Infrastructure: For secure data storage and application hosting\n\nAll third-party providers are GDPR-compliant and process data under strict contractual obligations.',
      },
      dataStorage: {
        title: '7. Data Storage and Security',
        content: 'Your data is stored securely using:\n\n• Encrypted passwords using industry-standard hashing\n• Secure PostgreSQL database with access controls\n• HTTPS encryption for all data transmission\n• Regular security updates and monitoring\n\nData is stored on servers located in [EU/France - update based on your actual hosting]. We retain your data as long as your account is active or as needed to provide services.',
      },
      yourRights: {
        title: '8. Your Rights (GDPR)',
        content: 'Under GDPR, you have the right to:\n\n• Access: Request a copy of your personal data\n• Rectification: Correct inaccurate or incomplete data\n• Erasure: Request deletion of your data ("right to be forgotten")\n• Restriction: Limit how we process your data\n• Portability: Receive your data in a machine-readable format\n• Objection: Object to certain data processing activities\n• Withdraw Consent: Withdraw consent at any time for consent-based processing\n\nTo exercise these rights, contact us at contact@focushealth-services.fr',
      },
      dataRetention: {
        title: '9. Data Retention',
        content: 'We retain your personal data:\n\n• Account Data: Until you request account deletion\n• Course Progress: For the duration of your enrollment plus 3 years for record-keeping\n• Payment Records: 10 years as required by French tax law\n• Timeline Posts: Until deleted by you or an administrator\n\nAfter the retention period, data is securely deleted or anonymized.',
      },
      minors: {
        title: '10. Children\'s Privacy',
        content: 'Our service is not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.',
      },
      cookies: {
        title: '11. Cookies and Tracking',
        content: 'We use essential session cookies to:\n\n• Maintain your login session\n• Remember your language preference\n• Ensure application functionality\n\nWe do not use third-party analytics or advertising cookies.',
      },
      international: {
        title: '12. International Data Transfers',
        content: 'Your data is primarily stored and processed within the European Union. If data is transferred outside the EU, we ensure adequate safeguards are in place as required by GDPR.',
      },
      changes: {
        title: '13. Changes to Privacy Policy',
        content: 'We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use of the application after changes constitutes acceptance of the updated policy.',
      },
      contact: {
        title: '14. Contact Us',
        content: 'For privacy-related questions, concerns, or to exercise your rights:\n\nEmail: contact@focushealth-services.fr\nSupport: support@focushealth-academy.com\nAddress: Focus Health & Services\n14 Rue de Lattre de Tassigny\n67300 Schiltigheim, Strasbourg, France\n\nData Protection Authority (France):\nCommission Nationale de l\'Informatique et des Libertés (CNIL)\nwww.cnil.fr',
      },
    },
  },
  fr: {
    title: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour : 4 décembre 2025',
    sections: {
      intro: {
        title: '1. Introduction',
        content: 'Focus Health & Services (« nous », « notre », « nos ») exploite l\'application mobile Focus Health Academy. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre application. Nous nous engageons à protéger votre vie privée et à respecter le Règlement Général sur la Protection des Données (RGPD) et les lois françaises applicables en matière de protection des données.',
      },
      dataController: {
        title: '2. Responsable du Traitement',
        content: 'Focus Health & Services\n14 Rue de Lattre de Tassigny\n67300 Schiltigheim, Strasbourg\nFrance\n\nContact : contact@focushealth-services.fr\nSupport : support@focushealth-academy.com',
      },
      dataCollection: {
        title: '3. Informations Collectées',
        content: 'Nous collectons les types d\'informations suivants :\n\n• Informations Personnelles : Nom, adresse e-mail, mot de passe (crypté)\n• Informations de Profil : Photo de profil, numéro de téléphone (facultatif)\n• Données de Formation : Inscriptions aux cours, progression, statut d\'achèvement des leçons, certificats obtenus\n• Informations de Paiement : Historique des transactions, montants, devise (les détails de carte bancaire sont traités en toute sécurité par Stripe et ne sont pas stockés sur nos serveurs)\n• Inscriptions aux Événements : Registres de présence, dates d\'inscription, codes QR pour les événements en présentiel\n• Activité Utilisateur : Publications, commentaires et interactions dans l\'application\n• Données Techniques : Informations sur l\'appareil, adresse IP, statistiques d\'utilisation',
      },
      legalBasis: {
        title: '4. Base Légale du Traitement (RGPD)',
        content: 'Nous traitons vos données personnelles sur la base de :\n\n• Exécution du Contrat : Pour fournir les cours et services que vous avez achetés\n• Consentement : Pour les fonctionnalités optionnelles comme les photos de profil et les publications\n• Intérêt Légitime : Pour améliorer nos services, prévenir la fraude et assurer la sécurité\n• Obligation Légale : Pour se conformer aux réglementations financières et fiscales',
      },
      dataUse: {
        title: '5. Utilisation de Vos Informations',
        content: 'Nous utilisons vos informations pour :\n\n• Fournir l\'accès aux cours et événements achetés\n• Traiter les paiements et envoyer les confirmations d\'achat\n• Suivre votre progression et délivrer les certificats\n• Envoyer des e-mails transactionnels (bienvenue, confirmations d\'achat, réinitialisations de mot de passe, certificats)\n• Générer des codes QR pour les enregistrements aux événements en présentiel\n• Maintenir et améliorer les fonctionnalités de l\'application\n• Assurer la sécurité et prévenir les accès non autorisés\n• Respecter les obligations légales',
      },
      dataSharing: {
        title: '6. Partage des Données et Tiers',
        content: 'Nous ne vendons ni ne partageons vos données personnelles avec des tiers à des fins de marketing. Nous partageons uniquement les données avec :\n\n• Stripe : Pour le traitement sécurisé des paiements (soumis à la politique de confidentialité de Stripe)\n• Fournisseur de Services E-mail : Namecheap Private Email pour les e-mails transactionnels\n• Infrastructure Cloud : Pour le stockage sécurisé des données et l\'hébergement de l\'application\n\nTous les fournisseurs tiers sont conformes au RGPD et traitent les données selon des obligations contractuelles strictes.',
      },
      dataStorage: {
        title: '7. Stockage et Sécurité des Données',
        content: 'Vos données sont stockées en toute sécurité en utilisant :\n\n• Mots de passe cryptés avec un hachage standard de l\'industrie\n• Base de données PostgreSQL sécurisée avec contrôles d\'accès\n• Chiffrement HTTPS pour toute transmission de données\n• Mises à jour de sécurité et surveillance régulières\n\nLes données sont stockées sur des serveurs situés dans [UE/France - à mettre à jour selon votre hébergement réel]. Nous conservons vos données tant que votre compte est actif ou selon les besoins pour fournir les services.',
      },
      yourRights: {
        title: '8. Vos Droits (RGPD)',
        content: 'En vertu du RGPD, vous avez le droit de :\n\n• Accès : Demander une copie de vos données personnelles\n• Rectification : Corriger les données inexactes ou incomplètes\n• Effacement : Demander la suppression de vos données (« droit à l\'oubli »)\n• Limitation : Limiter la manière dont nous traitons vos données\n• Portabilité : Recevoir vos données dans un format lisible par machine\n• Opposition : S\'opposer à certaines activités de traitement de données\n• Retrait du Consentement : Retirer votre consentement à tout moment pour le traitement basé sur le consentement\n\nPour exercer ces droits, contactez-nous à contact@focushealth-services.fr',
      },
      dataRetention: {
        title: '9. Conservation des Données',
        content: 'Nous conservons vos données personnelles :\n\n• Données de Compte : Jusqu\'à ce que vous demandiez la suppression du compte\n• Progression des Cours : Pendant la durée de votre inscription plus 3 ans pour la tenue des registres\n• Registres de Paiement : 10 ans comme requis par la loi fiscale française\n• Publications : Jusqu\'à suppression par vous ou un administrateur\n\nAprès la période de conservation, les données sont supprimées en toute sécurité ou anonymisées.',
      },
      minors: {
        title: '10. Confidentialité des Mineurs',
        content: 'Notre service n\'est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas sciemment d\'informations personnelles auprès d\'enfants de moins de 16 ans. Si vous êtes parent ou tuteur et pensez que votre enfant nous a fourni des informations personnelles, veuillez nous contacter.',
      },
      cookies: {
        title: '11. Cookies et Suivi',
        content: 'Nous utilisons des cookies de session essentiels pour :\n\n• Maintenir votre session de connexion\n• Mémoriser votre préférence de langue\n• Assurer les fonctionnalités de l\'application\n\nNous n\'utilisons pas de cookies d\'analyse ou de publicité de tiers.',
      },
      international: {
        title: '12. Transferts Internationaux de Données',
        content: 'Vos données sont principalement stockées et traitées au sein de l\'Union Européenne. Si les données sont transférées en dehors de l\'UE, nous veillons à ce que des garanties adéquates soient en place comme l\'exige le RGPD.',
      },
      changes: {
        title: '13. Modifications de la Politique de Confidentialité',
        content: 'Nous pouvons mettre à jour cette Politique de Confidentialité périodiquement. Nous vous informerons des changements importants par e-mail ou notification dans l\'application. L\'utilisation continue de l\'application après les modifications constitue l\'acceptation de la politique mise à jour.',
      },
      contact: {
        title: '14. Nous Contacter',
        content: 'Pour toute question relative à la confidentialité, préoccupation ou pour exercer vos droits :\n\nE-mail : contact@focushealth-services.fr\nSupport : support@focushealth-academy.com\nAdresse : Focus Health & Services\n14 Rue de Lattre de Tassigny\n67300 Schiltigheim, Strasbourg, France\n\nAutorité de Protection des Données (France) :\nCommission Nationale de l\'Informatique et des Libertés (CNIL)\nwww.cnil.fr',
      },
    },
  },
};

const PrivacyPolicyScreen = () => {
  const { t, language } = useTranslation(translations);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('title')}</Text>
      <Text style={styles.lastUpdated}>{t('lastUpdated')}</Text>

      {Object.values(t('sections')).map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionContent}>{section.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  lastUpdated: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  sectionContent: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
});

export default PrivacyPolicyScreen;
