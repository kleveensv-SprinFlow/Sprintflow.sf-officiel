#!/bin/bash

##############################################################################
# Script d'Application des Migrations Supabase
#
# Ce script automatise le processus de synchronisation des migrations
# locales vers la base de données Supabase de production.
#
# Usage: ./scripts/apply-migrations.sh
##############################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project ID par défaut (extrait du .env)
DEFAULT_PROJECT_ID="kqlzvxfdzandgdkqzggj"

##############################################################################
# Fonctions utilitaires
##############################################################################

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

##############################################################################
# Vérifications préliminaires
##############################################################################

check_prerequisites() {
    print_header "Vérification des prérequis"

    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        exit 1
    fi
    print_success "Node.js est installé ($(node --version))"

    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    print_success "npm est installé ($(npm --version))"

    # Vérifier que nous sommes dans le bon répertoire
    if [ ! -f "package.json" ]; then
        print_error "Vous devez exécuter ce script depuis la racine du projet"
        exit 1
    fi
    print_success "Répertoire du projet détecté"

    # Vérifier le dossier migrations
    if [ ! -d "supabase/migrations" ]; then
        print_error "Le dossier supabase/migrations n'existe pas"
        exit 1
    fi

    MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    print_success "Dossier migrations trouvé ($MIGRATION_COUNT fichiers)"

    # Vérifier le CLI Supabase
    if ! npx supabase --version &> /dev/null; then
        print_error "Le CLI Supabase n'est pas accessible"
        exit 1
    fi
    print_success "CLI Supabase est accessible ($(npx supabase --version))"
}

##############################################################################
# Liaison avec le projet Supabase
##############################################################################

link_project() {
    print_header "Liaison avec le projet Supabase"

    # Demander le Project ID
    echo ""
    print_info "Votre Project ID se trouve dans l'URL du Dashboard Supabase:"
    print_info "https://supabase.com/dashboard/project/VOTRE_PROJECT_ID"
    echo ""
    print_info "Project ID par défaut détecté: ${DEFAULT_PROJECT_ID}"
    echo ""

    read -p "Entrez votre Project ID (ou appuyez sur Entrée pour utiliser ${DEFAULT_PROJECT_ID}): " PROJECT_ID
    PROJECT_ID=${PROJECT_ID:-$DEFAULT_PROJECT_ID}

    print_info "Utilisation du Project ID: ${PROJECT_ID}"

    # Vérifier si déjà lié
    if [ -f ".git/config" ]; then
        if grep -q "supabase" .git/config 2>/dev/null; then
            print_warning "Le projet semble déjà lié à Supabase"
            read -p "Voulez-vous re-lier le projet ? (o/N): " RELINK
            if [[ ! $RELINK =~ ^[Oo]$ ]]; then
                print_info "Liaison ignorée"
                return 0
            fi
        fi
    fi

    echo ""
    print_info "Vous allez être invité à fournir votre Access Token Supabase"
    print_info "Pour le générer:"
    print_info "1. Allez sur: https://supabase.com/dashboard/account/tokens"
    print_info "2. Cliquez sur 'Generate New Token'"
    print_info "3. Donnez-lui un nom (ex: CLI SprintFlow)"
    print_info "4. Copiez le token généré"
    echo ""
    print_warning "⚠️  NE PARTAGEZ JAMAIS CE TOKEN AVEC PERSONNE"
    echo ""

    read -p "Appuyez sur Entrée pour continuer..."

    echo ""
    print_info "Exécution de: npx supabase link --project-ref ${PROJECT_ID}"

    if npx supabase link --project-ref "${PROJECT_ID}"; then
        print_success "Projet lié avec succès!"
        return 0
    else
        print_error "Échec de la liaison avec le projet"
        return 1
    fi
}

##############################################################################
# Analyse des migrations
##############################################################################

analyze_migrations() {
    print_header "Analyse des migrations"

    print_info "Analyse des migrations locales..."
    echo ""

    # Lister les 10 dernières migrations
    echo "Les 10 migrations les plus récentes:"
    ls -1t supabase/migrations/*.sql | head -10 | while read file; do
        filename=$(basename "$file")
        echo "  - $filename"
    done

    echo ""
    print_info "Nombre total de migrations locales: $(ls -1 supabase/migrations/*.sql | wc -l)"

    # Afficher les migrations critiques
    echo ""
    print_warning "Migrations critiques à appliquer:"
    echo "  - 20251109065700_remove_avatar_url_column.sql"
    echo "    → Supprime la colonne redondante avatar_url"
    echo "  - 20251109081835_fix_coach_dashboard_remove_avatar_url.sql"
    echo "    → Corrige la fonction get_coach_dashboard_analytics"

    echo ""
    read -p "Voulez-vous voir les différences avec la production ? (o/N): " SHOW_DIFF

    if [[ $SHOW_DIFF =~ ^[Oo]$ ]]; then
        print_info "Analyse des différences avec la production..."
        npx supabase db diff --linked || true
    fi
}

##############################################################################
# Sauvegarde
##############################################################################

backup_reminder() {
    print_header "Sauvegarde de la base de données"

    print_warning "IMPORTANT: Il est fortement recommandé de créer une sauvegarde"
    print_warning "avant d'appliquer des migrations en production."
    echo ""
    print_info "Pour créer une sauvegarde:"
    print_info "1. Allez sur: https://supabase.com/dashboard"
    print_info "2. Sélectionnez votre projet"
    print_info "3. Allez dans Database → Backups"
    print_info "4. Cliquez sur 'Create Backup'"
    echo ""

    read -p "Avez-vous créé une sauvegarde récente ? (o/N): " HAS_BACKUP

    if [[ ! $HAS_BACKUP =~ ^[Oo]$ ]]; then
        print_warning "Nous vous recommandons fortement de créer une sauvegarde"
        read -p "Voulez-vous continuer sans sauvegarde ? (o/N): " CONTINUE_WITHOUT
        if [[ ! $CONTINUE_WITHOUT =~ ^[Oo]$ ]]; then
            print_info "Annulation de l'opération"
            exit 0
        fi
    else
        print_success "Sauvegarde confirmée"
    fi
}

##############################################################################
# Application des migrations
##############################################################################

apply_migrations() {
    print_header "Application des migrations"

    print_warning "Cette opération va modifier votre base de données de production"
    echo ""
    read -p "Êtes-vous sûr de vouloir continuer ? (o/N): " CONFIRM

    if [[ ! $CONFIRM =~ ^[Oo]$ ]]; then
        print_info "Opération annulée"
        exit 0
    fi

    echo ""
    print_info "Application des migrations en cours..."
    echo ""

    if npx supabase db push; then
        echo ""
        print_success "🎉 Toutes les migrations ont été appliquées avec succès!"
        return 0
    else
        echo ""
        print_error "Échec de l'application des migrations"
        print_info "Consultez les logs ci-dessus pour plus de détails"
        return 1
    fi
}

##############################################################################
# Vérifications post-migration
##############################################################################

post_migration_checks() {
    print_header "Vérifications post-migration"

    print_info "Vérifications recommandées:"
    echo ""
    echo "1. Vérifiez le Dashboard Supabase:"
    echo "   → Database → Migrations (toutes les migrations doivent être listées)"
    echo "   → Table Editor → profiles (vérifier que avatar_url n'existe plus)"
    echo "   → Database → Functions (vérifier get_coach_dashboard_analytics)"
    echo ""
    echo "2. Testez votre application localement:"
    echo "   → npm run dev"
    echo "   → Connectez-vous en tant que coach"
    echo "   → Vérifiez que les photos de profil s'affichent"
    echo "   → Vérifiez la console (F12) pour les erreurs 400"
    echo ""
    echo "3. Testez votre application en production:"
    echo "   → Accédez à votre URL de production"
    echo "   → Testez les mêmes fonctionnalités"
    echo ""
    echo "4. Redéployez si nécessaire:"
    echo "   → Si vous avez modifié du code, redéployez votre application"
    echo ""

    print_success "Migration terminée!"
    print_info "Consultez GUIDE_SYNCHRONISATION_MIGRATIONS.md pour plus de détails"
}

##############################################################################
# Fonction principale
##############################################################################

main() {
    clear

    print_header "Script d'Application des Migrations Supabase - SprintFlow"

    echo "Ce script va:"
    echo "  1. Vérifier les prérequis"
    echo "  2. Lier votre projet local avec Supabase"
    echo "  3. Analyser les migrations à appliquer"
    echo "  4. Appliquer les migrations en production"
    echo "  5. Vous guider dans les vérifications post-migration"
    echo ""

    read -p "Appuyez sur Entrée pour commencer..."

    # Étape 1: Vérifications
    check_prerequisites

    # Étape 2: Liaison
    link_project || exit 1

    # Étape 3: Analyse
    analyze_migrations

    # Étape 4: Sauvegarde
    backup_reminder

    # Étape 5: Application
    if apply_migrations; then
        # Étape 6: Vérifications
        post_migration_checks
    else
        print_error "Les migrations n'ont pas pu être appliquées"
        print_info "Consultez les logs pour plus de détails"
        exit 1
    fi
}

##############################################################################
# Exécution
##############################################################################

main "$@"
