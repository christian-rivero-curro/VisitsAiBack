import pdfplumber
import pandas as pd
import re

# Ruta al archivo PDF
pdf_path = "/Users/christian.rivero/Downloads/MUPGS_Resultats_Fase1.pdf"

# Lista donde almacenaremos las filas extraídas
rows = []

# Expresión regular para detectar líneas válidas con datos
line_pattern = re.compile(
    r"^([A-ZÀ-ÿ][a-zà-ÿ]+(?: [A-ZÀ-ÿ][a-zà-ÿ]+)*)\s+([A-ZÀ-ÿ][a-zà-ÿ]+(?: [A-ZÀ-ÿ][a-zà-ÿ]+)*)\s+([A-ZÀ-ÿ][a-zà-ÿ]+(?: [A-ZÀ-ÿ][a-zà-ÿ]+)*?)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)$"
)

# Abrimos el PDF
with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        if not text:
            continue
        for line in text.split("\n"):
            match = line_pattern.match(line.strip())
            if match:
                cognom1, cognom2, nom, nota_exp, anglès, examen, nota_final = match.groups()
                rows.append({
                    "Nom": f"{nom} {cognom1} {cognom2}",
                    "Nota_Expedient": float(nota_exp.replace(',', '.')),
                    "Angles": float(anglès.replace(',', '.')),
                    "Examen": float(examen.replace(',', '.')),
                    "Nota_Final": float(nota_final.replace(',', '.'))
                })

# Crear DataFrame
df = pd.DataFrame(rows)

# Ordenar por Nota Final descendente
df_sorted = df.sort_values(by="Nota_Final", ascending=False)

# Resetear el índice y agregar una columna "Posición"
df_sorted = df_sorted.reset_index(drop=True)
df_sorted.index += 1  # para que empiece desde 1 en lugar de 0
df_sorted.index.name = "Posición"

# Guardar en un archivo Excel
df_sorted.to_excel("resultats_ordenats.xlsx", index=True)



