import { supabase } from './supabase';

export const debugSupabase = async () => {
  console.log('🔍 Diagnostic Supabase...');
  
  try {
    // Test 1: Connexion Supabase
    const { data: { user } } = await supabase.auth.getUser();
    console.log('✅ Connexion Supabase OK');
    console.log('👤 Utilisateur actuel:', user?.email || 'Aucun');
    
    // Test 2: Vérifier les tables
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Table profiles:', profilesError.message);
    } else {
      console.log('✅ Table profiles accessible');
    }
    
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('count')
      .limit(1);
    
    if (activitiesError) {
      console.log('❌ Table activities:', activitiesError.message);
    } else {
      console.log('✅ Table activities accessible');
    }
    
    // Test 3: Test d'inscription
    console.log('🧪 Test d\'inscription...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: '123456',
    });
    
    if (signUpError) {
      console.log('❌ Erreur inscription:', signUpError.message);
    } else {
      console.log('✅ Inscription test OK');
      console.log('📧 Email de test:', testEmail);
    }
    
  } catch (error) {
    console.log('💥 Erreur générale:', error);
  }
};