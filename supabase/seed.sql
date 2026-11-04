-- Reference data for a fresh Supabase project: subscription plans and taxonomies.
-- Demo users/profiles are only seeded in the local mock store (src/lib/data/seed.ts)
-- because Supabase accounts must be created through Supabase Auth.
-- Prices are initial assumptions, not final commercial commitments.

insert into public.subscription_plans (id, segment, tier, name, tagline, price_monthly, price_yearly, benefits, entitlements, limits, recommended, sort_order) values
  ('plan_business_free', 'business', 'free', 'Business Free', 'Start finding partners at no cost.', 0, 0,
    array['Create a business profile', 'Browse partner profiles', 'Up to 2 active opportunities', 'Basic application management'],
    array[]::text[], '{"activeOpportunities":2,"monthlyApplications":0,"talentRoster":0,"teamMembers":1,"savedItems":25}', false, 1),
  ('plan_business_pro', 'business', 'pro', 'Business Pro', 'Scale partnerships across regions and channels.', 199000, 1990000,
    array['Up to 15 active opportunity listings', 'Advanced partner search', 'Access to advanced filters', 'Priority opportunity visibility', 'Partnership dashboard', 'Performance analytics'],
    array['advanced_search', 'advanced_filters', 'priority_visibility', 'partnership_dashboard', 'analytics'],
    '{"activeOpportunities":15,"monthlyApplications":0,"talentRoster":0,"teamMembers":1,"savedItems":500}', true, 2),
  ('plan_sales_free', 'sales', 'free', 'Sales Free', 'Build your profile and start applying.', 0, 0,
    array['Create a professional profile', 'Browse opportunities', 'Up to 10 applications per month', 'Basic portfolio'],
    array[]::text[], '{"activeOpportunities":0,"monthlyApplications":10,"talentRoster":0,"teamMembers":1,"savedItems":25}', false, 1),
  ('plan_sales_pro', 'sales', 'pro', 'Sales Pro', 'Stand out to businesses and land better deals.', 49000, 490000,
    array['Priority profile visibility', 'Up to 50 applications per month', 'Advanced opportunity filters', 'Professional performance dashboard', 'Verified profile badge, subject to verification', 'Access to premium opportunities'],
    array['priority_visibility', 'advanced_filters', 'analytics', 'verified_badge', 'premium_opportunities'],
    '{"activeOpportunities":0,"monthlyApplications":50,"talentRoster":0,"teamMembers":1,"savedItems":500}', true, 2),
  ('plan_creator_free', 'creator', 'free', 'Creator Free', 'Showcase your channels and find campaigns.', 0, 0,
    array['Create a creator / affiliate profile', 'Add social media accounts', 'Browse campaigns', 'Up to 10 applications per month', 'Basic portfolio'],
    array[]::text[], '{"activeOpportunities":0,"monthlyApplications":10,"talentRoster":0,"teamMembers":1,"savedItems":25}', false, 1),
  ('plan_creator_pro', 'creator', 'pro', 'Creator Pro', 'Get discovered first by the right brands.', 49000, 490000,
    array['Priority profile placement', 'Advanced campaign discovery', 'Analytics dashboard', 'Portfolio enhancement', 'Up to 50 campaign applications per month', 'Premium creator badge, subject to eligibility'],
    array['priority_visibility', 'advanced_filters', 'analytics', 'verified_badge', 'premium_opportunities'],
    '{"activeOpportunities":0,"monthlyApplications":50,"talentRoster":0,"teamMembers":1,"savedItems":500}', true, 2),
  ('plan_agency_free', 'agency', 'free', 'Agency Free', 'Put your agency on the map.', 0, 0,
    array['Create an agency profile', 'Showcase agency portfolio', 'Manage up to 5 talents', 'Browse business opportunities'],
    array[]::text[], '{"activeOpportunities":0,"monthlyApplications":15,"talentRoster":5,"teamMembers":1,"savedItems":25}', false, 1),
  ('plan_agency_pro', 'agency', 'pro', 'Agency Pro', 'Run every client partnership from one place.', 499000, 4990000,
    array['Expanded talent roster (up to 50)', 'Advanced agency dashboard', 'Up to 10 team members', 'Advanced analytics', 'Priority opportunity access', 'Centralized partnership management'],
    array['analytics', 'partnership_dashboard', 'team_members', 'priority_access', 'advanced_filters', 'premium_opportunities'],
    '{"activeOpportunities":0,"monthlyApplications":100,"talentRoster":50,"teamMembers":10,"savedItems":500}', true, 2);

insert into public.categories (kind, name)
select 'industry', unnest(array['Food & Beverage','Beauty & Personal Care','Fashion & Apparel','Consumer Electronics','FMCG','Agriculture','Health & Wellness','Home & Living','Software & SaaS','Financial Services','Logistics','Education','Manufacturing','Automotive','Property'])
union all
select 'niche', unnest(array['Beauty','Fashion','Food & Culinary','Tech & Gadgets','Parenting','Fitness','Travel','Lifestyle','Finance','Gaming','Education','Home & Decor','Automotive','Health'])
union all
select 'location', unnest(array['Jakarta','Surabaya','Bandung','Medan','Semarang','Makassar','Yogyakarta','Denpasar','Palembang','Balikpapan','Malang','Pekanbaru']);
