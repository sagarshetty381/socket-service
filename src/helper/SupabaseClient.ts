import { createClient } from '@supabase/supabase-js';

class SupabaseClient {
    public client;

    constructor() {    
        if (!this.client) { 
            this.client = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_ANON_KEY as string)
        }
    }
}

export default new SupabaseClient();