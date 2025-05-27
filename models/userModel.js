const supabase = require('../db');

exports.findByEmailOrUsername = async (identifier) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${identifier},email.eq.${identifier}`)
        .single();

    if (error) return null;
    return data;
};

exports.createUser = async (username, email, hashedPassword) => {
    const { data, error } = await supabase
        .from('users')
        .insert([{ username, email, password: hashedPassword }])
        .select();

    if (error) throw error;
    return data;
};

exports.findProfileById = async (id) => {
    const { data, error } = await supabase
        .from('users')
        .select('id, username, email, created_at')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
};
