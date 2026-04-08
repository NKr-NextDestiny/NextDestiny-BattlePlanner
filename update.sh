#!/usr/bin/env bash
set -euo pipefail

# Resolve project root (works even when called via symlink from /usr/local/bin)
SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
cd "$SCRIPT_DIR"

# Prompt that only accepts y or n
ask_yn() {
  local prompt="$1"
  while true; do
    read -p "$prompt (y/n) " answer
    case "$answer" in
      y|Y) return 0 ;;
      n|N) return 1 ;;
      *) echo "Please enter y or n." ;;
    esac
  done
}

# Run a command as the tactihub user (production only)
# Falls back to direct execution if tactihub user doesn't exist
run_as_tactihub() {
  if id "tactihub" &>/dev/null; then
    sudo -u tactihub bash -c "cd $SCRIPT_DIR && $*"
  else
    eval "$@"
  fi
}

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "=== TactiHub Update ==="
echo ""
echo "Current branch: $CURRENT_BRANCH"
echo ""
echo "── Current Branch ($CURRENT_BRANCH) ──"
echo "  [1] update — Pull, install, migrate, rebuild (keeps data)"
echo "  [2] reset  — Full reset: delete ALL data, rebuild from scratch"
echo ""
echo "── Dev ──"
echo "  [3] dev reset — Checkout dev, full reset from scratch"
echo ""
echo "── Git Only ──"
echo "  [4] pull main — Switch to main and pull (no build)"
echo "  [5] pull dev  — Switch to dev and pull (no build)"
echo ""
echo "── Produktiv ──"
echo "  [6] prod main  — Pull main, install, migrate, rebuild (keeps data)"
echo "  [7] prod dev   — Pull dev, install, migrate, rebuild (keeps data)"
echo "  [8] prod reset — Full reset: delete ALL data, rebuild from scratch"
echo ""

while true; do
  read -p "Enter mode (1-8): " mode
  case "$mode" in
    1) MODE="update"; BRANCH="$CURRENT_BRANCH"; break ;;
    2) MODE="dev-current"; break ;;
    3) MODE="dev"; break ;;
    4) MODE="pull"; BRANCH="main"; break ;;
    5) MODE="pull"; BRANCH="dev"; break ;;
    6) MODE="prod"; BRANCH="main"; break ;;
    7) MODE="prod"; BRANCH="dev"; break ;;
    8) MODE="prod-reset"; break ;;
    *) echo "Please enter 1-8." ;;
  esac
done

echo ""

if [ "$MODE" = "pull" ]; then
  echo "=== PULL ONLY (branch: $BRANCH) ==="
  echo "This will switch to '$BRANCH' and pull the latest changes."
  echo "No install, build, or migration steps will be performed."
  echo ""

  if [ "$BRANCH" != "$CURRENT_BRANCH" ]; then
    echo "--- Switching to $BRANCH ---"
    git checkout "$BRANCH"
  fi

  echo "--- Pulling latest $BRANCH ---"
  git pull origin "$BRANCH"

  echo ""
  echo "=== Pull complete! ==="
  echo "Branch is now on the latest '$BRANCH'. Run 'bash update.sh' mode 1 to build."

elif [ "$MODE" = "update" ]; then
  echo "=== UPDATE (branch: $BRANCH) ==="
  echo "This will pull the latest changes from '$BRANCH', install dependencies,"
  echo "apply database migrations, and rebuild the project."
  echo "Your existing data will be preserved."
  echo ""

  if ! ask_yn "Continue?"; then
    echo "Aborted."
    exit 0
  fi

  echo ""
  echo "--- Pulling latest $BRANCH ---"
  git pull origin "$BRANCH"

  echo ""
  echo "--- Installing dependencies ---"
  pnpm install

  echo ""
  echo "--- Building shared package ---"
  pnpm --filter @tactihub/shared build

  echo ""
  echo "--- Generating database migrations ---"
  pnpm db:generate

  echo ""
  echo "--- Applying database migrations ---"
  pnpm db:migrate

  echo ""
  echo "--- Building all packages ---"
  pnpm build

  echo ""
  echo "=== Update complete! ==="

  if ask_yn "Start dev server now?"; then
    pnpm dev
  else
    echo "Run 'pnpm dev' to start."
  fi

elif [ "$MODE" = "dev" ] || [ "$MODE" = "dev-current" ]; then
  if [ "$MODE" = "dev-current" ]; then
    RESET_BRANCH="$CURRENT_BRANCH"
  else
    RESET_BRANCH="dev"
  fi

  echo "=== FULL RESET (branch: $RESET_BRANCH) ==="
  echo "This will DELETE all database data (users, battleplans, everything)"
  echo "and rebuild the entire project from scratch."
  echo ""

  if ! ask_yn "Are you sure?"; then
    echo "Aborted."
    exit 0
  fi

  echo ""

  if ! ask_yn "Are you REALLY sure? All data will be permanently lost."; then
    echo "Aborted."
    exit 0
  fi

  echo ""
  echo "--- Pulling latest $RESET_BRANCH branch ---"
  if [ "$RESET_BRANCH" != "$CURRENT_BRANCH" ]; then
    git checkout "$RESET_BRANCH"
  fi
  git pull origin "$RESET_BRANCH"

  echo ""
  echo "--- Installing dependencies ---"
  pnpm install

  echo ""
  echo "--- Stopping containers & deleting volumes ---"
  docker compose down -v

  echo ""
  echo "--- Starting PostgreSQL + Redis ---"
  docker compose up -d

  echo ""
  echo "--- Waiting for PostgreSQL to be ready ---"
  until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
  done
  echo "PostgreSQL is ready."

  echo ""
  echo "--- Building shared package ---"
  pnpm --filter @tactihub/shared build

  echo ""
  echo "--- Cleaning old migration files ---"
  rm -rf packages/server/drizzle/*

  echo ""
  echo "--- Generating migrations ---"
  pnpm db:generate

  echo ""
  echo "--- Applying migrations ---"
  pnpm db:migrate

  echo ""
  echo "--- Seeding database ---"
  pnpm db:seed

  echo ""
  echo "--- Building all packages ---"
  pnpm build

  echo ""
  echo "=== Dev reset complete! ==="

  if ask_yn "Start dev server now?"; then
    pnpm dev
  else
    echo "Run 'pnpm dev' to start developing."
  fi

elif [ "$MODE" = "prod" ]; then
  echo "=== PRODUCTION UPDATE (branch: $BRANCH) ==="
  echo "This will pull the latest changes from '$BRANCH', install dependencies,"
  echo "apply database migrations, and rebuild the project."
  echo "Your existing data will be preserved."
  echo ""
  echo "All build operations run as the 'tactihub' user."
  echo ""

  if ! ask_yn "Continue with production update?"; then
    echo "Aborted."
    exit 0
  fi

  echo ""
  echo "--- Stopping TactiHub service ---"
  sudo systemctl stop tactihub 2>/dev/null || true

  echo ""
  echo "--- Fixing file ownership ---"
  if id "tactihub" &>/dev/null; then
    sudo chown -R tactihub:tactihub "$SCRIPT_DIR"
    echo "Ownership set to tactihub:tactihub"
  fi

  echo ""
  echo "--- Pulling latest $BRANCH branch ---"
  run_as_tactihub git checkout "$BRANCH"
  run_as_tactihub git pull origin "$BRANCH"

  echo ""
  echo "--- Installing dependencies ---"
  run_as_tactihub pnpm install

  echo ""
  echo "--- Building shared package ---"
  run_as_tactihub pnpm --filter @tactihub/shared build

  echo ""
  echo "--- Generating database migrations ---"
  run_as_tactihub pnpm db:generate

  echo ""
  echo "--- Applying database migrations ---"
  run_as_tactihub pnpm db:migrate

  echo ""
  echo "--- Building all packages ---"
  run_as_tactihub pnpm build

  echo ""
  echo "=== Production update complete! ==="

  if ask_yn "Restart TactiHub service now?"; then
    sudo systemctl restart tactihub
    sleep 2
    echo ""
    echo "--- Service status ---"
    sudo systemctl status tactihub --no-pager -l
  else
    echo "Run 'sudo systemctl restart tactihub' to apply changes."
  fi

elif [ "$MODE" = "prod-reset" ]; then
  echo "=== PRODUCTION RESET ==="
  echo "This will DELETE all database data (users, battleplans, everything)"
  echo "and rebuild the entire project from scratch in production mode."
  echo ""
  echo "All build operations run as the 'tactihub' user."
  echo ""

  if ! ask_yn "Are you sure?"; then
    echo "Aborted."
    exit 0
  fi

  echo ""

  if ! ask_yn "Are you REALLY sure? All data will be permanently lost."; then
    echo "Aborted."
    exit 0
  fi

  echo ""
  echo "Which branch should be used for the reset?"
  echo "  [1] main"
  echo "  [2] dev"
  echo ""

  while true; do
    read -p "Enter branch (1-2): " branch_choice
    case "$branch_choice" in
      1) RESET_BRANCH="main"; break ;;
      2) RESET_BRANCH="dev"; break ;;
      *) echo "Please enter 1 or 2." ;;
    esac
  done

  echo ""
  echo "--- Stopping TactiHub service ---"
  sudo systemctl stop tactihub 2>/dev/null || true

  echo ""
  echo "--- Fixing file ownership ---"
  if id "tactihub" &>/dev/null; then
    sudo chown -R tactihub:tactihub "$SCRIPT_DIR"
    echo "Ownership set to tactihub:tactihub"
  fi

  echo ""
  echo "--- Pulling latest $RESET_BRANCH branch ---"
  run_as_tactihub git checkout "$RESET_BRANCH"
  run_as_tactihub git pull origin "$RESET_BRANCH"

  echo ""
  echo "--- Installing dependencies ---"
  run_as_tactihub pnpm install

  echo ""
  echo "--- Stopping containers & deleting volumes ---"
  docker compose down -v

  echo ""
  echo "--- Starting PostgreSQL + Redis ---"
  docker compose up -d

  echo ""
  echo "--- Waiting for PostgreSQL to be ready ---"
  until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
  done
  echo "PostgreSQL is ready."

  echo ""
  echo "--- Building shared package ---"
  run_as_tactihub pnpm --filter @tactihub/shared build

  echo ""
  echo "--- Cleaning old migration files ---"
  run_as_tactihub rm -rf packages/server/drizzle/*

  echo ""
  echo "--- Generating migrations ---"
  run_as_tactihub pnpm db:generate

  echo ""
  echo "--- Applying migrations ---"
  run_as_tactihub pnpm db:migrate

  echo ""
  echo "--- Seeding database ---"
  run_as_tactihub pnpm db:seed

  echo ""
  echo "--- Building all packages ---"
  run_as_tactihub pnpm build

  echo ""
  echo "=== Production reset complete! ==="

  if ask_yn "Restart TactiHub service now?"; then
    sudo systemctl restart tactihub
    sleep 2
    echo ""
    echo "--- Service status ---"
    sudo systemctl status tactihub --no-pager -l
  else
    echo "Run 'sudo systemctl restart tactihub' to apply changes."
  fi
fi
