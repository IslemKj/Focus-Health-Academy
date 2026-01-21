from django.core.management.base import BaseCommand
from courses.models import Course
from accounts.models import User
from decimal import Decimal
import uuid


class Command(BaseCommand):
    help = 'Populate Med In Touch in-person training courses'

    def handle(self, *args, **kwargs):
        # Get or create Med In Touch instructor
        teacher, created = User.objects.get_or_create(
            email='instructor@medintouch-academy.com',
            defaults={
                'username': 'medintouch_instructor',
                'first_name': 'Med In Touch',
                'last_name': 'Academy',
                'role': 'teacher',
            }
        )
        
        if created:
            teacher.set_password('MedInTouch2025!')
            teacher.save()
            self.stdout.write(self.style.SUCCESS(f'Created instructor user: {teacher.email}'))
        courses_data = [
            # Formation Secours & Prévention
            {
                'code': 'FOR-IPS-25',
                'title': 'Formation Initiation aux Gestes de Premiers Secours',
                'description': "L'objectif est d'apporter une connaissance minimale afin de se protéger face à une situation à risque mais également de porter secours sur certaines urgences.\n\nDurée : 1h00\nGroupe de 5 à 10 personnes",
                'price': Decimal('450.00'),
                'category': 'medical',
                'level': 'beginner',
            },
            {
                'code': 'FOR-PSC1-25',
                'title': 'Formation Prévention et Secours Civique de Niveau 1 (PSC1)',
                'description': "La formation PSC est idéale pour toute personne de plus de 10 ans susceptible d'être confrontée à un malaise ou à un accident, que ce soit sur le lieu de travail, à domicile ou en extérieur.\n\nCette formation représente le brevet de secouriste de niveau 1 permettant au grand public de faire face à diverses situations d'urgence. Cette formation se déroule sur une journée de 7h00 et donne lieu à une certification reconnue en France. Cette formation sera dispensée par une association agréée de sécurité civile.\n\nGroupe de 5 à 10 personnes",
                'price': Decimal('1200.00'),
                'category': 'medical',
                'level': 'beginner',
            },
            {
                'code': 'FOR-SST-25',
                'title': 'Formation Sauveteur Sécuriste du Travail (SST)',
                'description': "La formation SST est conçue pour toute personne souhaitant acquérir les compétences nécessaires afin d'intervenir efficacement face à un malaise ou un accident, sur le lieu de travail comme dans la vie quotidienne.\n\nCette formation se déroule sur deux jours consécutifs de 14h00 et donne lieu à une certification reconnue en France. Cette formation sera dispensée par une entreprise agréée auprès de l'INRS.\n\nGroupe de 5 à 10 personnes",
                'price': Decimal('2100.00'),
                'category': 'medical',
                'level': 'intermediate',
            },
            {
                'code': 'FOR-Inc-25',
                'title': 'Formation Incendie',
                'description': "La formation Incendie permet à chaque participant d'acquérir les bons réflexes face à un départ de feu, au travail comme à domicile.\n\nCette formation se déroule sur une demi-journée.\n\nGroupe de 5 à 10 personnes",
                'price': Decimal('800.00'),
                'category': 'other',
                'level': 'beginner',
            },
            {
                'code': 'For-G-Ser-25',
                'title': "Formation Evacuation – Guide-file et Serre-file",
                'description': "La formation Évacuation – Guide-file et Serre-file prépare les participants à assurer un rôle essentiel en cas d'alerte incendie ou d'évacuation d'urgence.\n\nCette formation se déroule sur une demi-journée.\n\nGroupe de 5 à 10 personnes",
                'price': Decimal('750.00'),
                'category': 'other',
                'level': 'beginner',
            },
            {
                'code': 'For-Prevention-Risque',
                'title': 'Formation Prévention des Risques au Travail',
                'description': "La formation Prévention des Risques au Travail a pour objectif de sensibiliser et former les salariés à l'identification, l'évaluation et la maîtrise des risques professionnels.\n\nCette formation se déroule sur une journée de 7h00. Groupe de 5 à 10 personnes",
                'price': Decimal('850.00'),
                'category': 'other',
                'level': 'intermediate',
            },
            {
                'code': 'For-Ges-Stre-25',
                'title': 'Formation Gestion du Stress Chez les Soignants',
                'description': "La formation Gestion du Stress chez les Soignants est spécialement conçue pour le personnel médical et paramédical confronté à des situations exigeantes et émotionnellement intenses.\n\nCette formation se déroule sur une journée de 7h00. Groupe de 5 à 10 personnes",
                'price': Decimal('1400.00'),
                'category': 'psychology',
                'level': 'intermediate',
            },
            
            # Formation Spécifique (Advanced Medical Training)
            {
                'code': 'FOR-PHTLS-25',
                'title': 'PreHospital Trauma Life Support (PHTLS)',
                'description': "La formation PHTLS (PreHospital Trauma Life Support) est une formation internationale de référence destinée aux professionnels de santé amenés à prendre en charge les urgences vitales lors d'une prise en charge préhospitalière des traumatisés graves.\n\nCette formation se déroule sur deux jours consécutifs.\n\nLa formation PreHospital Trauma Life Support (PHTLS) est destinée aux professionnels de santé amenés à prendre en charge des urgences vitales chez l'enfant et le nourrisson. Elle repose sur les recommandations européennes les plus récentes.",
                'price': Decimal('1200.00'),
                'category': 'medical',
                'level': 'advanced',
            },
            {
                'code': 'FOR-EPC-25',
                'title': 'European Paediatric Course (EPC)',
                'description': "La formation EPC (European Paediatric Course) est destinée aux professionnels de santé amenés à prendre en charge des urgences vitales chez l'enfant et le nourrisson. Elle repose sur les recommandations européennes les plus récentes.\n\nCette formation se déroule sur deux jours consécutifs.",
                'price': Decimal('1250.00'),
                'category': 'medical',
                'level': 'advanced',
            },
            {
                'code': 'FOR-AMLS-25',
                'title': 'Advanced Medical Life Support (AMLS)',
                'description': "La formation AMLS (Advanced Medical Life Support) est une formation internationale de référence destinée aux professionnels de santé et de secours impliqués dans la prise en charge préhospitalière des urgences médicales. Elle est validée par la NAEMT (National Association of Emergency Medical Technicians).\n\nCette formation se déroule sur deux jours consécutifs.",
                'price': Decimal('1250.00'),
                'category': 'medical',
                'level': 'advanced',
            },
            {
                'code': 'FOR-ACLS-25',
                'title': 'Advanced Cardiovascular Life Support (ACLS)',
                'description': "La formation ACLS (Advanced Cardiovascular Life Support) est destinée aux professionnels de santé amenés à prendre en charge des urgences cardiovasculaires graves. Elle est basée sur les recommandations de l'American Heart Association (AHA).\n\nCette formation se déroule sur deux jours consécutifs.",
                'price': Decimal('1250.00'),
                'category': 'medical',
                'level': 'advanced',
            },
            {
                'code': 'FOR-GEMS-25',
                'title': 'Geriatric Education for EMS (GEMS)',
                'description': "La formation GEMS (Geriatric Education for EMS) est une formation internationale de référence destinée aux professionnels de santé et de secours impliqués dans la prise en charge préhospitalière et hospitalière des patients âgés. Elle est validée par la NAEMT (National Association of Emergency Medical Technicians).\n\nCette formation se déroule sur deux jours consécutifs.",
                'price': Decimal('1250.00'),
                'category': 'medical',
                'level': 'advanced',
            },
            {
                'code': 'FOR-TCCC-25',
                'title': 'Tactical Combat Casualty Care (TCCC)',
                'description': "La formation TCCC (Tactical Combat Casualty Care) est la référence internationale en matière de prise en charge des blessés en situation tactique ou de combat. Elle est validée par la NAEMT (National Association of Emergency Medical Technicians) et repose sur les protocoles du Comité TCCC.\n\nCette formation se déroule sur quatre jours consécutifs.",
                'price': Decimal('1900.00'),
                'category': 'medical',
                'level': 'advanced',
            },
            {
                'code': 'FOR-XABCDE-25',
                'title': 'XABCDE - Approche Systématique des Urgences',
                'description': "La formation XABCDE (eXsanguination, Airway, Breathing, Circulation, Disability, Exposure) est une formation basée sur une approche systématique et méthodique pour l'évaluation et la prise en charge des victimes en situation d'urgence. Elle s'appuie sur une approche systématique et méthodique de la médecine d'urgence et de traumatologie.\n\nCette formation se déroule sur deux jours consécutifs.",
                'price': Decimal('950.00'),
                'category': 'medical',
                'level': 'advanced',
            },
            {
                'code': 'FOR-TFR-25',
                'title': 'Trauma First Response (TFR)',
                'description': "La formation TFR est conçue pour les premiers intervenants non-médicaux et les professionnels de santé peu ou pas initiés, susceptibles d'être confrontés à des traumatismes graves avant l'arrivée des secours spécialisés. Elle est validée par la NAEMT (National Association of Emergency Medical Technicians).\n\nCette formation se déroule sur une journée.",
                'price': Decimal('700.00'),
                'category': 'medical',
                'level': 'intermediate',
            },
            {
                'code': 'FOR-TECC-25',
                'title': 'Tactical Emergency Casualty Care (TECC)',
                'description': "La formation TECC (Tactical Emergency Casualty Care) est une formation internationale destinée aux secouristes, professionnels de santé, forces de l'ordre et intervenants civils confrontés à des situations d'urgence en contexte hostile (attentats, fusillades, catastrophes, environnements hostiles). Elle est validée par la NAEMT (National Association of Emergency Medical Technicians) et adaptée au contexte civil sur la base des recommandations du Comité TCCC.\n\nCette formation se déroule sur deux jours consécutifs.",
                'price': Decimal('1250.00'),
                'category': 'medical',
                'level': 'advanced',
            },
        ]

        created_count = 0
        updated_count = 0

        for course_data in courses_data:
            # Check if course with this code already exists
            existing_course = Course.objects.filter(title__icontains=course_data['code']).first()
            
            if existing_course:
                # Update existing course
                existing_course.title = course_data['title']
                existing_course.description = course_data['description']
                existing_course.price = course_data['price']
                existing_course.category = course_data['category']
                existing_course.level = course_data['level']
                existing_course.is_in_person = True
                existing_course.is_online = False
                existing_course.is_published = True
                existing_course.save()
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Updated course: {course_data["title"]}')
                )
            else:
                # Create new course
                course = Course.objects.create(
                    title=course_data['title'],
                    description=course_data['description'],
                    price=course_data['price'],
                    category=course_data['category'],
                    level=course_data['level'],
                    is_in_person=True,
                    is_online=False,
                    is_published=True,
                    teacher=teacher,
                    duration_weeks=0,
                    max_students=10,
                )
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created course: {course_data["title"]} (ID: {course.id})')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nCourses populated successfully!\nCreated: {created_count}\nUpdated: {updated_count}\nTotal: {created_count + updated_count}'
            )
        )
