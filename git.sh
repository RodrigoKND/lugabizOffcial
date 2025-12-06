#!/bin/bash

# Obtener rama actual
branch=$(git branch --show-current)
branch_main="main"

# Obtener lista real de archivos modificados
mapfile -t files < <(git status --porcelain | awk '{print $2}')

if [ ${#files[@]} -eq 0 ]; then
    echo "No hay cambios en el repositorio."
    exit 0
fi

echo "Archivos cambiados:"
git status --porcelain
echo ""

# Recorrer y preguntar archivo por archivo
for file in "${files[@]}"; do
    echo "¿Quieres commitear este archivo?: $file"
    read -p "(s/n): " r

    if [[ "$r" == "s" ]]; then
        git add "$file"

        read -p "Mensaje de commit para '$file': " msg

        git commit -m "$msg" -- "$file"
        echo "✔ Commit hecho para $file"
    else
        echo "⏩ Saltado: $file"
    fi

    echo ""
done

# Hacer push según rama
echo "Haciendo push en la rama '$branch'..."

if [[ "$branch" == "$branch_main" ]]; then
    git push origin main
else
    git push --set-upstream origin "$branch"
fi

echo "✔ Todo listo."
