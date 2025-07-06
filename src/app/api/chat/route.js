// Fișier: src/app/api/chat/route.js - VERSIUNE ÎMBUNĂTĂȚITĂ

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(request) {
  const { originalText, question } = await request.json();

  if (!originalText || !question) {
    return NextResponse.json({ success: false, error: "Textul sursă și întrebarea sunt obligatorii." }, { status: 400 });
  }

  // ***** AICI ESTE NOUL PROMPT, MAI INTELIGENT *****
  const chatPrompt = `
    PERSOANĂ: Ești un "Knowledge Architect Expert", un asistent AI specializat în a aprofunda și explica un document specific. Misiunea ta este să ajuți utilizatorul să înțeleagă textul sursă în profunzime.

    CONTEXT: Ai la dispoziție următorul text sursă, care a fost deja pre-procesat și structurat.
    --- TEXT SURSĂ ---
    ${originalText}
    --- SFÂRȘIT TEXT SURSĂ ---

    REGULI DE INTERACȚIUNE:
    1.  **Răspunde DOAR pe baza textului sursă.** Nu adăuga informații din exterior.
    2.  **Fii un partener, nu un robot.** Anticipează nevoia utilizatorului. Dacă te întreabă "sunt toate întrebările acolo?", nu răspunde doar cu "da". În schimb, spune "Da, iată din nou lista completă de întrebări menționată în secțiunea X, pentru a-ți fi mai ușor:" și apoi listează-le.
    3.  **Prioritizează utilitatea.** Scopul tău este să oferi claritate. Dacă o întrebare este ambiguă, poți cere o clarificare, dar mai întâi încearcă să oferi cel mai probabil răspuns.
    4.  **Când dezvolți o idee,** folosește citate scurte sau parafraze din textul sursă pentru a-ți susține explicațiile.
    5.  **Fii concis, dar complet.** Nu oferi răspunsuri de un singur cuvânt.

    CONVERSAȚIA PÂNĂ ACUM:
    (Momentan ignorăm istoricul pentru simplitate, dar ne bazăm pe ultima întrebare)

    ULTIMA ÎNTREBARE A UTILIZATORULUI: "${question}"

    RĂSPUNSUL TĂU DE EXPERT:
  `;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    
    const result = await model.generateContent(chatPrompt);
    const response = await result.response;
    const aiTextResponse = response.text();

    return NextResponse.json({ success: true, data: aiTextResponse });

  } catch (error) {
    console.error("Eroare în /api/chat:", error);
    return NextResponse.json({ success: false, error: "A apărut o eroare la procesarea AI." }, { status: 500 });
  }
}