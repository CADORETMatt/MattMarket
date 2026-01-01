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
if [ ! -d "$DOSSIER2" ]; then
    echo "Erreur : $DOSSIER2 n'existe pas."
    exit 1
fi
echo "Dossier local repéré."

# Suppression dossier dans chemin1
rm -rf "$DOSSIER1"
echo "Suppression ancien distant : ok."

# Copie depuis chemin2 vers chemin1
cp -r "$DOSSIER2" "$DOSSIER1"
echo "Copie pour envoi : ok."
# Git add / commit / push
cd "$DOSSIER1" || exit
git add .
echo "Git add ok."

echo -n "Message du commit : "
read MESSAGE

git commit -m "$MESSAGE"
echo "Commit ok."
git push

echo "Synchronisation + push terminés."
