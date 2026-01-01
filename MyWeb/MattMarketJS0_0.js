  // === Configuration Supabase ===
const { createClient } = supabase;
const supabaseUrl = 'https://cpktnkjahurhvhabwnsf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa3Rua2phaHVyaHZoYWJ3bnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NTAxMjIsImV4cCI6MjA2MTAyNjEyMn0.YRYNYYTa4OGSG2a1tnNPGtp4KPf-tp9ooY4l0ZV3CDU';

const supabaseClient = createClient(supabaseUrl, supabaseKey);

 // === Fonction pour enregistrer une visite ===
  async function logVisit() {
    const visitData = {
      user_agent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
     // screen_width: screen.width,
     // screen_height: screen.height,
   //   window_width: window.innerWidth,
    //  window_height: window.innerHeight,
      performance_now: performance.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from('visites')
      .insert([visitData]);

    if (error) {
      console.error('Erreur d\'enregistrement de la visite :', error.message);
    }
  }

  // === Appel automatique au chargement de la page ===
  window.addEventListener('load', logVisit);

/*(async () => {
  const { data, error } = await supabase
    .from('stats')
    .insert([
      { type: 'page', target: 'page', ip: 'test-ip' }
    ]);

  if (error) {
    console.error('Erreur Supabase :', error);
  } else {
    console.log('Visite enregistrée !', data);
  }
})();
*/
function afficherParagraphe(idPara) {
      // Masquer tous les paragraphes d'abord
      document.querySelectorAll('.cached').forEach(p => p.style.display = 'none');
    
      // Afficher uniquement le paragraphe demandé
      document.getElementById(idPara).style.display = 'block';

      // Masquer les boutons
     // 1ère question
      document.querySelectorAll('.bouton').forEach(b => b.style.display = 'none');
  
    }
function afficherQuestion2(idQuestion, idPara) {
  // Masquer uniquement la 2e question (le bloc qui contient les boutons)
  document.getElementById(idQuestion).style.display = 'none';

  // Masquer uniquement les boutons de la 2e question
  document.querySelectorAll('.bouton2').forEach(b => b.style.display = 'none');

  // Afficher le paragraphe demandé
  document.getElementById(idPara).style.display = 'block';
}
