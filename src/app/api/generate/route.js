// Fișier: src/app/api/generate/route.js - Versiune cu debugging îmbunătățit

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import pdf from 'pdf-parse';

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
    // Verifică dacă API key-ul există
    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY nu este setat!");
      return NextResponse.json({ 
        success: false, 
        error: "Configurația API nu este completă. Contactați administratorul." 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: "Niciun fișier încărcat." }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let textContent = '';

    if (file.type === 'application/pdf') {
      try {
        const data = await pdf(buffer);
        textContent = data.text;
      } catch (pdfError) {
        console.error("Eroare la parsarea PDF:", pdfError);
        return NextResponse.json({ 
          success: false, 
          error: "Nu s-a putut procesa fișierul PDF. Verificați dacă fișierul nu este corupt." 
        }, { status: 400 });
      }
    } else if (file.type === 'text/plain') {
      textContent = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ success: false, error: "Format de fișier neacceptat." }, { status: 400 });
    }

    if (!textContent.trim()) {
      return NextResponse.json({ success: false, error: "Nu s-a putut extrage text din fișier." }, { status: 400 });
    }

    // Verifică dimensiunea textului
    const textLength = textContent.length;
    console.log(`Text extracted, length: ${textLength} characters`);

    // Limitează textul dacă e prea lung (Gemini Pro are limite)
    const MAX_TEXT_LENGTH = 30000; // ~30k caractere pentru siguranță
    if (textLength > MAX_TEXT_LENGTH) {
      console.log(`Text prea lung (${textLength}), se truncă la ${MAX_TEXT_LENGTH}`);
      textContent = textContent.substring(0, MAX_TEXT_LENGTH) + "\n\n[NOTA: Textul a fost truncat din cauza limitărilor tehnice]";
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      
      const finalPrompt = `${metaprompt}\n\n---\n\nTEXT SURSĂ DE ANALIZAT:\n\n${textContent}`;
      
      console.log("Sending request to Google AI...");
      const result = await model.generateContent(finalPrompt);
      const response = await result.response;
      const aiTextResponse = response.text();

      console.log("AI response received successfully");
      return NextResponse.json({ success: true, data: aiTextResponse });

    } catch (aiError) {
      console.error("Eroare Google AI:", aiError);
      
      // Verifică diferite tipuri de erori
      if (aiError.message?.includes('API key')) {
        return NextResponse.json({ 
          success: false, 
          error: "Problemă cu autentificarea API. Contactați administratorul." 
        }, { status: 500 });
      }
      
      if (aiError.message?.includes('quota') || aiError.message?.includes('rate')) {
        return NextResponse.json({ 
          success: false, 
          error: "Serviciul este temporar indisponibil din cauza limitărilor. Încercați din nou în câteva minute." 
        }, { status: 429 });
      }
      
      if (aiError.message?.includes('content')) {
        return NextResponse.json({ 
          success: false, 
          error: "Conținutul documentului nu poate fi procesat. Încercați un fișier mai mic sau diferit." 
        }, { status: 400 });
      }

      // Eroare generică
      return NextResponse.json({ 
        success: false, 
        error: `Eroare la procesarea cu AI: ${aiError.message || 'Eroare necunoscută'}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Eroare generală în /api/generate:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      success: false, 
      error: `A apărut o eroare la procesarea fișierului: ${errorMessage}` 
    }, { status: 500 });
  }
}