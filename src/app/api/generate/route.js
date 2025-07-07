// Fișier: src/app/api/generate/route.js - VERSIUNEA CU CURĂȚARE ROBUSTĂ

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import pdf from 'pdf-parse';

export const runtime = 'nodejs';

// O funcție nouă, robustă, pentru a curăța textul
function cleanText(text) {
  let cleanString = "";
  for (let i = 0; i < text.length; i++) {
    // Verificăm dacă codul caracterului este în intervalul standard ASCII (0-127)
    if (text.charCodeAt(i) <= 127) {
      cleanString += text.charAt(i);
    } else {
      // Opțional: putem înlocui caracterele necunoscute cu un spațiu
      // în loc să le ștergem, pentru a nu uni cuvinte accidental.
      cleanString += ' ';
    }
  }
  // Eliminăm spațiile multiple care ar putea rezulta
  return cleanString.replace(/\s+/g, ' ').trim();
}


const metaprompt = `
ROL & OBIECTIV: Ești un "Arhitect de Cunoștințe Acționabile"... 
... (Lăsați tot metapromptul complet aici, așa cum era) ...
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

    // ***** AICI ESTE NOUA SOLUȚIE, MULT MAI ROBUSTĂ *****
    // Folosim funcția de reconstrucție pentru a garanta un text curat.
    const cleanedTextContent = cleanText(textContent);

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    
    const finalPrompt = `${metaprompt}\n\n---\n\nTEXT SURSĂ DE ANALIZAT:\n\n${cleanedTextContent}`;
    
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const aiTextResponse = response.text();
    return NextResponse.json({ success: true, data: aiTextResponse });

  } catch (error) {
    console.error("Eroare în /api/generate:", error);
    // Adăugăm mai multe detalii în mesajul de eroare
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: `A apărut o eroare la procesarea fișierului: ${errorMessage}` }, { status: 500 });
  }
}