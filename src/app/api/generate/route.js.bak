// Fișier: src/app/api/generate/route.js - Versiune pentru deploy pe Render

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import pdf from 'pdf-parse';

export const runtime = 'nodejs';

// Metapromptul complet, gata de utilizare
const metaprompt = `
ROL & OBIECTIV: Ești un "Arhitect de Cunoștințe Acționabile". Misiunea ta este să citești și să distilezi textul sursă furnizat într-o bază de cunoștințe de înaltă densitate și aplicabilitate. Obiectivul tău NU este să rezumi, ci să extragi exclusiv acele informații care pot fi puse în practică.
PRINCIPIUL DIRECTOR: Aplică riguros Legea lui Pareto (Regula 80/20). Concentrează-te doar pe acele 20% de concepte din text care generează 80% din valoarea practică.

PROCES:
1. Citește integral textul sursă.
2. Vânează activ și exclusiv informațiile care se potrivesc în următoarele 6 categorii.
3. Formatează output-ul final conform structurii obligatorii specificate mai jos.

CATEGORII DE INFORMAȚII DE EXTRAS (FILTRE POZITIVE):
1. Modele Mentale: Explicații fundamentale despre cum funcționează un sistem.
2. Principii & Legi Fundamentale: Reguli universale și adevăruri de bază.
3. Tehnici & Tactici Specifice: Pași concreți, secvențiali.
4. Euristici (Reguli Practice): "Reguli de buzunar" pentru decizii rapide.
5. Checkliste & Întrebări Cheie: 
    - Ce sunt: Liste de verificare sau întrebări puternice care forțează reflecția.
    - INSTRUCȚIUNE SPECIALĂ: Dacă găsești o listă de verificare sau o serie de întrebări, extrage-le pe toate, complet și fără prescurtări. Este esențial ca lista să fie integrală.
6. Anti-modele & Greșeli Costisitoare (Antipatterns): Lecții extrase din greșeli.

INSTRUCȚIUNI NEGATIVE (CE SĂ IGNOREZI):
- Povești și Anecdote: NU rezuma poveștile. Extrage DOAR lecția.
- Informații Generice și Clișee.

FORMATUL DE OUTPUT OBLIGATORIU:
Folosește următoarea structură Markdown. Pentru fiecare element extras, trebuie să completezi obligatoriu ambele câmpuri: Esența și Contextul de Aplicare.
# Baza de Cunoștințe Acționabile din: [Numele sursei]
## 1. Modele Mentale
- **Esența:** [Descrierea concisă]
  **Context de Aplicare:** [O frază: Când/unde/de ce se folosește]
## 2. Principii & Legi Fundamentale
- **Esența:** [Descrierea concisă]
  **Context de Aplicare:** [O frază: Când/unde/de ce se aplică]
## 3. Tehnici & Tactici Specifice
- **Esența:** [Descrierea concisă]
  **Context de Aplicare:** [O frază: Când/unde/de ce se folosește]
## 4. Euristici (Reguli Practice)
- **Esența:** [Descrierea concisă]
  **Context de Aplicare:** [O frază: Când/unde/de ce se folosește]
## 5. Checkliste & Întrebări Cheie
- **Esența:** [Lista de verificare sau întrebarea cheie, extrasă integral]
  **Context de Aplicare:** [O frază: Când/unde/de ce se folosește]
## 6. Anti-modele & Greșeli Costisitoare
- **Esența:** [Descrierea concisă]
  **Context de Aplicare:** [O frază: Când/unde apare și de ce trebuie evitat]
`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: "Niciun fișier încărcat." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let textContent = '';

    if (file.type === 'application/pdf') {
      const data = await pdf(buffer);
      textContent = data.text;
    } else if (file.type === 'text/plain') {
      textContent = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ success: false, error: "Format de fișier neacceptat." }, { status: 400 });
    }

    if (!textContent.trim()) {
      return NextResponse.json({ success: false, error: "Nu s-a putut extrage text din fișier." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    
    // Trimitem textul extras direct, fără funcția de curățare
    const finalPrompt = `${metaprompt}\n\n---\n\nTEXT SURSĂ DE ANALIZAT:\n\n${textContent}`;
    
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const aiTextResponse = response.text();

    return NextResponse.json({ success: true, data: aiTextResponse });

  } catch (error) {
    console.error("Eroare în /api/generate:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: `A apărut o eroare la procesarea fișierului: ${errorMessage}` }, { status: 500 });
  }
}