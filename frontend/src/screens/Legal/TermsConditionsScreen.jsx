/**
 * TermsConditionsScreen
 * Terms and Conditions in English and French
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
    title: 'Terms and Conditions',
    lastUpdated: 'Last Updated: December 4, 2025',
    sections: {
      acceptance: {
        title: '1. Acceptance of Terms',
        content: 'By accessing and using the Focus Health Academy mobile application, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our application.\n\nThese terms constitute a legally binding agreement between you and Focus Health & Services, a company registered in France.',
      },
      company: {
        title: '2. Company Information',
        content: 'Focus Health & Services\n14 Rue de Lattre de Tassigny\n67300 Schiltigheim, Strasbourg\nFrance\n\nContact: contact@focushealth-services.fr\nSupport: support@focushealth-academy.com',
      },
      eligibility: {
        title: '3. Eligibility',
        content: 'You must be at least 16 years old to use this application. By using Focus Health Academy, you represent and warrant that you meet this age requirement.\n\nIf you are using the application on behalf of an organization, you represent that you have the authority to bind that organization to these terms.',
      },
      account: {
        title: '4. User Accounts',
        content: 'To access certain features, you must create an account. You agree to:\n\n• Provide accurate, current, and complete information\n• Maintain the security of your password\n• Notify us immediately of any unauthorized access\n• Be responsible for all activities under your account\n• Not share your account credentials with others\n\nWe reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.',
      },
      services: {
        title: '5. Services Provided',
        content: 'Focus Health Academy provides:\n\n• Online courses and educational content\n• In-person seminars and events\n• Learning progress tracking and certificates\n• Community timeline for sharing educational content\n• Digital tickets and QR codes for event attendance\n\nWe reserve the right to modify, suspend, or discontinue any service at any time with reasonable notice.',
      },
      payments: {
        title: '6. Payments and Pricing',
        content: 'Course and Event Purchases:\n• All prices are displayed in EUR (Euro) or other specified currencies\n• Payments are processed securely through Stripe\n• You will receive a confirmation email after successful payment\n• Prices may change at any time, but existing purchases are honored\n\nPayment Methods:\n• Credit/debit cards via Stripe\n• All payment information is processed securely and not stored on our servers',
      },
      refunds: {
        title: '7. Refund Policy',
        content: 'Non-Refundable Purchases:\nAll course and event purchases are generally non-refundable. However, we may provide refunds in the following exceptional circumstances:\n\n• Technical errors that prevent access to purchased content\n• Duplicate purchases made in error\n• Event cancellations by Focus Health & Services\n• Other exceptional circumstances at our sole discretion\n\nRefund Requests:\nTo request a refund, contact support@focushealth-academy.com within 14 days of purchase with your order details. Refund requests will be reviewed on a case-by-case basis.\n\nEvent Cancellations:\nIf we cancel an event, you will receive a full refund or credit toward a future event.',
      },
      intellectual: {
        title: '8. Intellectual Property',
        content: 'All content on Focus Health Academy, including courses, videos, documents, images, logos, and trademarks, are owned by Focus Health & Services or licensed to us.\n\nYou are granted a limited, non-exclusive, non-transferable license to:\n• Access and view course content for personal, non-commercial use\n• Download materials explicitly marked as downloadable\n• Use certificates earned for professional purposes\n\nYou may NOT:\n• Copy, reproduce, or distribute course content\n• Share your account access with others\n• Record, screenshot, or redistribute course videos\n• Use content for commercial purposes without written permission\n• Remove copyright or proprietary notices',
      },
      userContent: {
        title: '9. User-Generated Content',
        content: 'Timeline Posts:\nUsers may post content on the community timeline. By posting, you grant Focus Health & Services a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content within the application.\n\nYou agree NOT to post:\n• Illegal, harmful, or offensive content\n• Copyrighted material without permission\n• Personal information of others\n• Spam, advertisements, or promotional content\n• Misinformation or false health claims\n\nWe reserve the right to remove any content that violates these terms or is deemed inappropriate.',
      },
      conduct: {
        title: '10. Prohibited Conduct',
        content: 'You agree NOT to:\n\n• Violate any applicable laws or regulations\n• Impersonate others or provide false information\n• Harass, abuse, or harm other users\n• Attempt to gain unauthorized access to systems\n• Use automated tools (bots, scrapers) without permission\n• Interfere with application functionality\n• Engage in fraudulent activities\n• Share or sell course access or content\n\nViolations may result in immediate account termination and legal action.',
      },
      certificates: {
        title: '11. Certificates and Credentials',
        content: 'Digital Certificates:\nUpon course completion, you may receive a digital certificate. These certificates:\n\n• Verify completion of course requirements\n• Are issued by Focus Health & Services\n• Can be shared for professional purposes\n• May include verification QR codes\n\nAccreditation:\nUnless explicitly stated, courses are not accredited by external bodies. Certificates represent completion of our educational programs.',
      },
      events: {
        title: '12. In-Person Events',
        content: 'Event Registration:\n• Registration is subject to availability\n• You will receive a digital ticket with QR code\n• Present your QR code for event check-in\n\nEvent Policies:\n• Attendees must comply with venue rules and health regulations\n• Events may be rescheduled or cancelled due to unforeseen circumstances\n• We are not liable for travel or accommodation expenses\n• Photography/recording may occur; attendance implies consent',
      },
      liability: {
        title: '13. Limitation of Liability',
        content: 'To the maximum extent permitted by law:\n\n• Focus Health Academy is provided "as is" without warranties\n• We do not guarantee uninterrupted or error-free service\n• We are not liable for indirect, incidental, or consequential damages\n• Our total liability is limited to the amount you paid in the past 12 months\n• We are not responsible for third-party content or services (e.g., Stripe)\n\nMedical Disclaimer:\nCourses are for educational purposes only and do not constitute medical advice. Consult qualified healthcare professionals for medical decisions.',
      },
      privacy: {
        title: '14. Privacy and Data Protection',
        content: 'Your use of Focus Health Academy is also governed by our Privacy Policy. We comply with GDPR and French data protection laws.\n\nKey points:\n• We collect and process data as described in our Privacy Policy\n• You have rights to access, correct, and delete your data\n• We use secure encryption and industry-standard security practices\n• Contact contact@focushealth-services.fr for privacy concerns',
      },
      termination: {
        title: '15. Termination',
        content: 'You may terminate your account at any time by contacting support. Upon termination:\n\n• Your access to paid content will be revoked\n• Personal data will be handled according to our Privacy Policy\n• No refunds will be issued for remaining course access\n\nWe may terminate or suspend your account immediately if:\n• You violate these Terms and Conditions\n• Your account is involved in fraudulent activity\n• Required by law or legal process\n• We cease operations (with reasonable notice)',
      },
      changes: {
        title: '16. Changes to Terms',
        content: 'We reserve the right to modify these Terms and Conditions at any time. We will notify you of significant changes via:\n\n• Email notification\n• In-app notification\n• Updated "Last Updated" date\n\nContinued use of the application after changes constitutes acceptance of the new terms. If you disagree with changes, you must stop using the application.',
      },
      governing: {
        title: '17. Governing Law',
        content: 'These Terms and Conditions are governed by the laws of France. Any disputes will be subject to the exclusive jurisdiction of the courts in Strasbourg, France.\n\nFor EU consumers, you retain rights under local consumer protection laws.',
      },
      dispute: {
        title: '18. Dispute Resolution',
        content: 'Before initiating legal action, we encourage you to contact us to resolve disputes informally:\n\nEmail: contact@focushealth-services.fr\n\nEU consumers may also use the Online Dispute Resolution platform: https://ec.europa.eu/consumers/odr',
      },
      contact: {
        title: '19. Contact Information',
        content: 'For questions, concerns, or support:\n\nFocus Health & Services\n14 Rue de Lattre de Tassigny\n67300 Schiltigheim, Strasbourg\nFrance\n\nGeneral Inquiries: contact@focushealth-services.fr\nTechnical Support: support@focushealth-academy.com',
      },
      severability: {
        title: '20. Severability',
        content: 'If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.',
      },
    },
  },
  fr: {
    title: 'Conditions Générales d\'Utilisation',
    lastUpdated: 'Dernière mise à jour : 4 décembre 2025',
    sections: {
      acceptance: {
        title: '1. Acceptation des Conditions',
        content: 'En accédant et en utilisant l\'application mobile Focus Health Academy, vous acceptez et vous engagez à respecter ces Conditions Générales d\'Utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser notre application.\n\nCes conditions constituent un accord juridiquement contraignant entre vous et Focus Health & Services, une société enregistrée en France.',
      },
      company: {
        title: '2. Informations sur la Société',
        content: 'Focus Health & Services\n14 Rue de Lattre de Tassigny\n67300 Schiltigheim, Strasbourg\nFrance\n\nContact : contact@focushealth-services.fr\nSupport : support@focushealth-academy.com',
      },
      eligibility: {
        title: '3. Éligibilité',
        content: 'Vous devez avoir au moins 16 ans pour utiliser cette application. En utilisant Focus Health Academy, vous déclarez et garantissez que vous remplissez cette condition d\'âge.\n\nSi vous utilisez l\'application au nom d\'une organisation, vous déclarez avoir l\'autorité pour engager cette organisation vis-à-vis de ces conditions.',
      },
      account: {
        title: '4. Comptes Utilisateurs',
        content: 'Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous acceptez de :\n\n• Fournir des informations exactes, à jour et complètes\n• Maintenir la sécurité de votre mot de passe\n• Nous informer immédiatement de tout accès non autorisé\n• Être responsable de toutes les activités sur votre compte\n• Ne pas partager vos identifiants de compte avec d\'autres\n\nNous nous réservons le droit de suspendre ou de résilier les comptes qui violent ces conditions ou se livrent à des activités frauduleuses.',
      },
      services: {
        title: '5. Services Fournis',
        content: 'Focus Health Academy fournit :\n\n• Des cours en ligne et du contenu éducatif\n• Des séminaires et événements en présentiel\n• Le suivi de la progression d\'apprentissage et les certificats\n• Un fil d\'actualités communautaire pour partager du contenu éducatif\n• Des billets numériques et codes QR pour la participation aux événements\n\nNous nous réservons le droit de modifier, suspendre ou interrompre tout service à tout moment avec un préavis raisonnable.',
      },
      payments: {
        title: '6. Paiements et Tarification',
        content: 'Achats de Cours et Événements :\n• Tous les prix sont affichés en EUR (Euro) ou autres devises spécifiées\n• Les paiements sont traités en toute sécurité via Stripe\n• Vous recevrez un e-mail de confirmation après un paiement réussi\n• Les prix peuvent changer à tout moment, mais les achats existants sont honorés\n\nMéthodes de Paiement :\n• Cartes de crédit/débit via Stripe\n• Toutes les informations de paiement sont traitées en toute sécurité et ne sont pas stockées sur nos serveurs',
      },
      refunds: {
        title: '7. Politique de Remboursement',
        content: 'Achats Non Remboursables :\nTous les achats de cours et d\'événements sont généralement non remboursables. Cependant, nous pouvons fournir des remboursements dans les circonstances exceptionnelles suivantes :\n\n• Erreurs techniques empêchant l\'accès au contenu acheté\n• Achats en double effectués par erreur\n• Annulations d\'événements par Focus Health & Services\n• Autres circonstances exceptionnelles à notre seule discrétion\n\nDemandes de Remboursement :\nPour demander un remboursement, contactez support@focushealth-academy.com dans les 14 jours suivant l\'achat avec les détails de votre commande. Les demandes seront examinées au cas par cas.\n\nAnnulations d\'Événements :\nSi nous annulons un événement, vous recevrez un remboursement complet ou un crédit pour un événement futur.',
      },
      intellectual: {
        title: '8. Propriété Intellectuelle',
        content: 'Tout le contenu de Focus Health Academy, y compris les cours, vidéos, documents, images, logos et marques, appartient à Focus Health & Services ou nous est concédé sous licence.\n\nVous bénéficiez d\'une licence limitée, non exclusive et non transférable pour :\n• Accéder et consulter le contenu des cours à des fins personnelles et non commerciales\n• Télécharger les documents explicitement marqués comme téléchargeables\n• Utiliser les certificats obtenus à des fins professionnelles\n\nVous ne pouvez PAS :\n• Copier, reproduire ou distribuer le contenu des cours\n• Partager l\'accès à votre compte avec d\'autres\n• Enregistrer, capturer ou redistribuer les vidéos de cours\n• Utiliser le contenu à des fins commerciales sans autorisation écrite\n• Supprimer les mentions de droit d\'auteur ou de propriété',
      },
      userContent: {
        title: '9. Contenu Généré par les Utilisateurs',
        content: 'Publications sur le Fil :\nLes utilisateurs peuvent publier du contenu sur le fil communautaire. En publiant, vous accordez à Focus Health & Services une licence mondiale, non exclusive et libre de droits pour utiliser, afficher et distribuer votre contenu au sein de l\'application.\n\nVous acceptez de NE PAS publier :\n• Du contenu illégal, nuisible ou offensant\n• Du matériel protégé par des droits d\'auteur sans permission\n• Des informations personnelles d\'autrui\n• Du spam, des publicités ou du contenu promotionnel\n• De la désinformation ou de fausses allégations de santé\n\nNous nous réservons le droit de supprimer tout contenu qui viole ces conditions ou est jugé inapproprié.',
      },
      conduct: {
        title: '10. Conduite Interdite',
        content: 'Vous acceptez de NE PAS :\n\n• Violer les lois ou règlements applicables\n• Usurper l\'identité d\'autrui ou fournir de fausses informations\n• Harceler, abuser ou nuire à d\'autres utilisateurs\n• Tenter d\'accéder de manière non autorisée aux systèmes\n• Utiliser des outils automatisés (bots, scrapers) sans permission\n• Interférer avec les fonctionnalités de l\'application\n• Se livrer à des activités frauduleuses\n• Partager ou vendre l\'accès aux cours ou au contenu\n\nLes violations peuvent entraîner la résiliation immédiate du compte et des poursuites judiciaires.',
      },
      certificates: {
        title: '11. Certificats et Attestations',
        content: 'Certificats Numériques :\nAprès l\'achèvement d\'un cours, vous pouvez recevoir un certificat numérique. Ces certificats :\n\n• Vérifient l\'achèvement des exigences du cours\n• Sont délivrés par Focus Health & Services\n• Peuvent être partagés à des fins professionnelles\n• Peuvent inclure des codes QR de vérification\n\nAccréditation :\nSauf indication explicite contraire, les cours ne sont pas accrédités par des organismes externes. Les certificats représentent l\'achèvement de nos programmes éducatifs.',
      },
      events: {
        title: '12. Événements en Présentiel',
        content: 'Inscription aux Événements :\n• L\'inscription est soumise à disponibilité\n• Vous recevrez un billet numérique avec code QR\n• Présentez votre code QR pour l\'enregistrement à l\'événement\n\nPolitiques d\'Événement :\n• Les participants doivent se conformer aux règles du lieu et aux règlements sanitaires\n• Les événements peuvent être reportés ou annulés en raison de circonstances imprévues\n• Nous ne sommes pas responsables des frais de voyage ou d\'hébergement\n• Des photos/enregistrements peuvent avoir lieu ; la participation implique le consentement',
      },
      liability: {
        title: '13. Limitation de Responsabilité',
        content: 'Dans toute la mesure permise par la loi :\n\n• Focus Health Academy est fourni "tel quel" sans garanties\n• Nous ne garantissons pas un service ininterrompu ou sans erreur\n• Nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs\n• Notre responsabilité totale est limitée au montant que vous avez payé au cours des 12 derniers mois\n• Nous ne sommes pas responsables du contenu ou des services tiers (ex : Stripe)\n\nAvertissement Médical :\nLes cours sont à des fins éducatives uniquement et ne constituent pas des conseils médicaux. Consultez des professionnels de santé qualifiés pour les décisions médicales.',
      },
      privacy: {
        title: '14. Confidentialité et Protection des Données',
        content: 'Votre utilisation de Focus Health Academy est également régie par notre Politique de Confidentialité. Nous nous conformons au RGPD et aux lois françaises sur la protection des données.\n\nPoints clés :\n• Nous collectons et traitons les données comme décrit dans notre Politique de Confidentialité\n• Vous avez le droit d\'accéder, de corriger et de supprimer vos données\n• Nous utilisons un chiffrement sécurisé et des pratiques de sécurité standard de l\'industrie\n• Contactez contact@focushealth-services.fr pour les préoccupations relatives à la confidentialité',
      },
      termination: {
        title: '15. Résiliation',
        content: 'Vous pouvez résilier votre compte à tout moment en contactant le support. Lors de la résiliation :\n\n• Votre accès au contenu payant sera révoqué\n• Les données personnelles seront traitées conformément à notre Politique de Confidentialité\n• Aucun remboursement ne sera accordé pour l\'accès aux cours restants\n\nNous pouvons résilier ou suspendre votre compte immédiatement si :\n• Vous violez ces Conditions Générales d\'Utilisation\n• Votre compte est impliqué dans une activité frauduleuse\n• Requis par la loi ou un processus juridique\n• Nous cessons nos opérations (avec préavis raisonnable)',
      },
      changes: {
        title: '16. Modifications des Conditions',
        content: 'Nous nous réservons le droit de modifier ces Conditions Générales d\'Utilisation à tout moment. Nous vous informerons des changements importants via :\n\n• Notification par e-mail\n• Notification dans l\'application\n• Date "Dernière mise à jour" actualisée\n\nL\'utilisation continue de l\'application après les modifications constitue l\'acceptation des nouvelles conditions. Si vous n\'êtes pas d\'accord avec les modifications, vous devez cesser d\'utiliser l\'application.',
      },
      governing: {
        title: '17. Droit Applicable',
        content: 'Ces Conditions Générales d\'Utilisation sont régies par les lois de la France. Tout litige sera soumis à la juridiction exclusive des tribunaux de Strasbourg, France.\n\nPour les consommateurs de l\'UE, vous conservez les droits en vertu des lois locales de protection des consommateurs.',
      },
      dispute: {
        title: '18. Résolution des Litiges',
        content: 'Avant d\'engager une action en justice, nous vous encourageons à nous contacter pour résoudre les litiges de manière informelle :\n\nE-mail : contact@focushealth-services.fr\n\nLes consommateurs de l\'UE peuvent également utiliser la plateforme de Résolution des Litiges en Ligne : https://ec.europa.eu/consumers/odr',
      },
      contact: {
        title: '19. Coordonnées',
        content: 'Pour toute question, préoccupation ou support :\n\nFocus Health & Services\n14 Rue de Lattre de Tassigny\n67300 Schiltigheim, Strasbourg\nFrance\n\nDemandes Générales : contact@focushealth-services.fr\nSupport Technique : support@focushealth-academy.com',
      },
      severability: {
        title: '20. Divisibilité',
        content: 'Si une disposition de ces Conditions est jugée inapplicable ou invalide, cette disposition sera limitée ou éliminée dans la mesure minimale nécessaire, et les dispositions restantes resteront pleinement en vigueur.',
      },
    },
  },
};

const TermsConditionsScreen = () => {
  const { t } = useTranslation(translations);

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

export default TermsConditionsScreen;
