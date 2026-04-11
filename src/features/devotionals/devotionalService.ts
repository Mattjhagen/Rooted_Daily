// src/features/devotionals/devotionalService.ts

import { createClient } from '@supabase/supabase-js';
import { Devotional, DevotionalSubmission } from './types';

/**
 * CONTENT POLICY: Devotionals submitted through this feature are reviewed
 * before publication. Submissions must be scripture-centered and may not
 * contain commercial promotions, solicitations, or content contradicting
 * basic Christian orthodoxy as defined by the Nicene Creed.
 * 
 * PRIVACY: Submitter email addresses are stored only for contact purposes
 * and are never displayed publicly. Include this in your privacy policy.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY || ''; // admin only

// Create the public client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create the admin client (use with caution, only for admin screens)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Public feed ---
export async function getApprovedDevotionals(limit = 20, offset = 0): Promise<Devotional[]> {
  const { data, error } = await supabase
    .from('devotionals')
    .select(`*, organization:organizations(*)`)
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[devotionalService] Error fetching approved devotionals:', error);
    throw error;
  }
  return (data as any) ?? [];
}

// --- Submission ---
export async function submitDevotional(submission: DevotionalSubmission): Promise<void> {
  // 1. Upsert org by email
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .upsert(
      { 
        name: submission.orgName, 
        contact_email: submission.contactEmail, 
        website_url: submission.websiteUrl 
      }, 
      { onConflict: 'contact_email' }
    )
    .select()
    .single();

  if (orgError) {
    console.error('[devotionalService] Error upserting organization:', orgError);
    throw orgError;
  }

  // 2. Insert devotional with pending status
  const { error: devError } = await supabase.from('devotionals').insert({
    org_id: org.id,
    title: submission.title,
    body: submission.body,
    verse_ref: submission.verseRef,
    author_name: submission.authorName,
    author_title: submission.authorTitle,
    theme: submission.theme,
    scheduled_for: submission.scheduledFor,
    status: 'pending',
  });

  if (devError) {
    console.error('[devotionalService] Error inserting devotional:', devError);
    throw devError;
  }
}

// --- Admin: fetch pending ---
export async function getPendingDevotionals(): Promise<Devotional[]> {
  const { data, error } = await supabaseAdmin
    .from('devotionals')
    .select(`*, organization:organizations(*)`)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[devotionalService] Error fetching pending devotionals:', error);
    throw error;
  }
  return (data as any) ?? [];
}

// --- Admin: approve ---
export async function approveDevotional(id: string, verseText: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('devotionals')
    .update({ 
      status: 'approved', 
      approved_at: new Date().toISOString(), 
      verse_text: verseText 
    })
    .eq('id', id);
    
  if (error) {
    console.error('[devotionalService] Error approving devotional:', error);
    throw error;
  }
}

// --- Admin: reject ---
export async function rejectDevotional(id: string, reason: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('devotionals')
    .update({ 
      status: 'rejected', 
      rejection_reason: reason 
    })
    .eq('id', id);
    
  if (error) {
    console.error('[devotionalService] Error rejecting devotional:', error);
    throw error;
  }
}
