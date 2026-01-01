#!/data/data/com.termux/files/usr/bin/bash

# --- CONFIG À MODIFIER ---
CHEMIN1="/data/data/com.termux/files/home/github/"
CHEMIN2="/data/data/com.termux/files/home/storage/documents/progdoc/"
# --------------------------

# Demande du nom du dossier
echo -n "Nom du dossier : "
read NOM

DOSSIER1="$CHEMIN1/$NOM"
DOSSIER2="$CHEMIN2/$NOM"

# Vérification dossier
if [ ! -d "$DOSSIER1" ]; then
    echo "Erreur : $DOSSIER1 n'existe pas."
    exit 1
fi

# Git pull
cd "$DOSSIER1" || exit
git pull

# Vérification dossier
# Suppression ancien dossier dans chemin2
if [ -d "$DOSSIER2" ]; then
    rm -rf "$DOSSIER2"
fi

# Copie du dossier depuis chemin1 vers chemin2
cp -r "$DOSSIER1" "$DOSSIER2"

echo "Synchronisation terminée."
