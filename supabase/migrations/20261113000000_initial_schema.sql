-- Vibe social app: core schema and row-level security.
--
-- Targets Supabase Postgres. Assumes `auth.users` and `auth.uid()` exist and
-- that the `anon` and `authenticated` roles are present (both are created by
-- Supabase). Apply with the Supabase CLI from supabase/migrations.
--
-- Design decisions:
--   * RLS is enabled on every table. Clients only ever act as `authenticated`;
--     `anon` is granted nothing, so the app requires a session.
--   * Authors are taken from auth.uid() in policies, never from client input.
--   * Engagement counters are denormalised and maintained by SECURITY DEFINER
--     triggers, because clients may not update another user's post or profile.
--   * Conversation membership is checked through a SECURITY DEFINER helper to
--     avoid recursive RLS on conversation_members.
--   * Column-level grants keep counters and ownership out of client reach even
--     though RLS already limits which rows are visible.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.post_type as enum ('image', 'video');

create type public.notification_type as enum ('like', 'comment', 'follow', 'mention');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null default '',
  avatar_url text,
  bio text not null default '',
  followers_count integer not null default 0
    constraint profiles_followers_count_nonnegative check (followers_count >= 0),
  following_count integer not null default 0
    constraint profiles_following_count_nonnegative check (following_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,30}$')
);

create unique index profiles_username_key on public.profiles (lower(username));

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  type public.post_type not null,
  caption text not null default '' check (char_length(caption) <= 2200),
  media_url text not null check (char_length(media_url) <= 2048),
  thumbnail_url text check (char_length(thumbnail_url) <= 2048),
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  likes_count integer not null default 0 check (likes_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  saves_count integer not null default 0 check (saves_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index posts_feed_idx on public.posts (created_at desc, id desc)
  where deleted_at is null;
create index posts_author_idx on public.posts (author_id, created_at desc)
  where deleted_at is null;

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index comments_post_idx on public.comments (post_id, created_at desc)
  where deleted_at is null;
create index comments_author_idx on public.comments (author_id);
create index comments_parent_idx on public.comments (parent_id);

create table public.comment_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  comment_id uuid not null references public.comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

create index comment_likes_comment_idx on public.comment_likes (comment_id);

create table public.post_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index post_likes_post_idx on public.post_likes (post_id);

create table public.post_saves (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index post_saves_post_idx on public.post_saves (post_id);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index follows_following_idx on public.follows (following_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx
  on public.notifications (recipient_id, created_at desc);
create index notifications_unread_idx
  on public.notifications (recipient_id) where read_at is null;
create index notifications_actor_idx on public.notifications (actor_id);
create index notifications_post_idx on public.notifications (post_id);
create index notifications_comment_idx on public.notifications (comment_id);

-- A like and a follow notification are deduplicated per actor/target so that
-- liking, unliking and liking again does not spam the recipient.
create unique index notifications_like_unique_idx
  on public.notifications (recipient_id, actor_id, post_id)
  where type = 'like';

create unique index notifications_follow_unique_idx
  on public.notifications (recipient_id, actor_id)
  where type = 'follow';

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'direct' check (kind in ('direct', 'group')),
  direct_key text unique,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  constraint conversations_direct_key_required
    check (kind <> 'direct' or direct_key is not null)
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index conversation_members_user_idx on public.conversation_members (user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index messages_conversation_idx
  on public.messages (conversation_id, created_at desc);
create index messages_sender_idx on public.messages (sender_id);

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

-- Membership is read through a definer function so that policies on
-- conversation_members do not recurse into themselves.
create or replace function public.is_conversation_member(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members m
    where m.conversation_id = target_conversation_id
      and m.user_id = (select auth.uid())
  );
$$;

-- Creates (or returns) the single direct conversation between the caller and
-- one peer. Clients cannot insert conversations or members directly.
create or replace function public.get_or_create_direct_conversation(peer_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  conversation_key text;
  conversation_id uuid;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if peer_id = me then
    raise exception 'cannot start a conversation with yourself' using errcode = '22023';
  end if;

  if not exists (select 1 from public.profiles where id = peer_id) then
    raise exception 'recipient does not exist' using errcode = '23503';
  end if;

  conversation_key := least(me::text, peer_id::text) || ':' || greatest(me::text, peer_id::text);

  select id into conversation_id
  from public.conversations
  where direct_key = conversation_key;

  if conversation_id is null then
    insert into public.conversations (kind, direct_key)
    values ('direct', conversation_key)
    on conflict (direct_key) do nothing
    returning id into conversation_id;

    if conversation_id is null then
      select id into conversation_id
      from public.conversations
      where direct_key = conversation_key;
    end if;

    insert into public.conversation_members (conversation_id, user_id)
    values (conversation_id, me), (conversation_id, peer_id)
    on conflict do nothing;
  end if;

  return conversation_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Trigger functions
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Creates a profile for every new auth user. The username comes from sign-up
-- metadata, is normalised, and gets a numeric suffix if already taken.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
  candidate text;
  suffix integer := 0;
begin
  base_username := lower(coalesce(
    new.raw_user_meta_data ->> 'username',
    'user_' || substr(new.id::text, 1, 8)
  ));
  base_username := regexp_replace(base_username, '[^a-z0-9_]', '', 'g');
  if char_length(base_username) < 3 then
    base_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  base_username := left(base_username, 24);

  candidate := base_username;
  while exists (select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := left(base_username, 20) || '_' || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data ->> 'display_name', candidate)
  );

  return new;
end;
$$;

create or replace function public.sync_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set likes_count = likes_count + 1
    where id = new.post_id;
    return new;
  end if;

  update public.posts
  set likes_count = greatest(likes_count - 1, 0)
  where id = old.post_id;
  return old;
end;
$$;

create or replace function public.sync_post_save_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set saves_count = saves_count + 1
    where id = new.post_id;
    return new;
  end if;

  update public.posts
  set saves_count = greatest(saves_count - 1, 0)
  where id = old.post_id;
  return old;
end;
$$;

create or replace function public.sync_comment_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set comments_count = comments_count + 1
    where id = new.post_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.posts
    set comments_count = greatest(comments_count - 1, 0)
    where id = old.post_id;
    return old;
  end if;

  -- Soft delete and restore only change the count on a deleted_at transition.
  if old.deleted_at is null and new.deleted_at is not null then
    update public.posts
    set comments_count = greatest(comments_count - 1, 0)
    where id = new.post_id;
  elsif old.deleted_at is not null and new.deleted_at is null then
    update public.posts
    set comments_count = comments_count + 1
    where id = new.post_id;
  end if;

  return new;
end;
$$;

create or replace function public.sync_comment_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.comments
    set likes_count = likes_count + 1
    where id = new.comment_id;
    return new;
  end if;

  update public.comments
  set likes_count = greatest(likes_count - 1, 0)
  where id = old.comment_id;
  return old;
end;
$$;

create or replace function public.sync_follow_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles
    set following_count = following_count + 1
    where id = new.follower_id;

    update public.profiles
    set followers_count = followers_count + 1
    where id = new.following_id;

    return new;
  end if;

  update public.profiles
  set following_count = greatest(following_count - 1, 0)
  where id = old.follower_id;

  update public.profiles
  set followers_count = greatest(followers_count - 1, 0)
  where id = old.following_id;

  return old;
end;
$$;

create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create or replace function public.notify_on_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_author uuid;
begin
  select author_id into post_author
  from public.posts
  where id = new.post_id;

  if post_author is not null and post_author <> new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, post_id)
    values (post_author, new.user_id, 'like', new.post_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_author uuid;
  parent_author uuid;
begin
  select author_id into post_author
  from public.posts
  where id = new.post_id;

  if post_author is not null and post_author <> new.author_id then
    insert into public.notifications (recipient_id, actor_id, type, post_id, comment_id)
    values (post_author, new.author_id, 'comment', new.post_id, new.id);
  end if;

  if new.parent_id is not null then
    select author_id into parent_author
    from public.comments
    where id = new.parent_id;

    if parent_author is not null
      and parent_author <> new.author_id
      and parent_author is distinct from post_author then
      insert into public.notifications (recipient_id, actor_id, type, post_id, comment_id)
      values (parent_author, new.author_id, 'comment', new.post_id, new.id);
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow')
  on conflict do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

create trigger post_likes_sync_count
  after insert or delete on public.post_likes
  for each row execute function public.sync_post_like_count();

create trigger post_saves_sync_count
  after insert or delete on public.post_saves
  for each row execute function public.sync_post_save_count();

create trigger comments_sync_count
  after insert or delete or update of deleted_at on public.comments
  for each row execute function public.sync_comment_count();

create trigger comment_likes_sync_count
  after insert or delete on public.comment_likes
  for each row execute function public.sync_comment_like_count();

create trigger follows_sync_counts
  after insert or delete on public.follows
  for each row execute function public.sync_follow_counts();

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

create trigger post_likes_notify
  after insert on public.post_likes
  for each row execute function public.notify_on_like();

create trigger comments_notify
  after insert on public.comments
  for each row execute function public.notify_on_comment();

create trigger follows_notify
  after insert on public.follows
  for each row execute function public.notify_on_follow();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_saves enable row level security;
alter table public.comment_likes enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- Profiles: public to signed-in users, editable only by their owner.
create policy profiles_select_authenticated on public.profiles
  for select to authenticated
  using (true);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Posts: visible while not soft-deleted; only the author writes them.
-- Authors keep visibility of their own soft-deleted rows. Postgres evaluates
-- the SELECT policy against the new row during UPDATE, so without this any
-- soft delete would be rejected as a row-level security violation.
create policy posts_select_visible on public.posts
  for select to authenticated
  using (deleted_at is null or author_id = (select auth.uid()));

create policy posts_insert_own on public.posts
  for insert to authenticated
  with check (author_id = (select auth.uid()));

create policy posts_update_own on public.posts
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy posts_delete_own on public.posts
  for delete to authenticated
  using (author_id = (select auth.uid()));

-- Comments: visible on visible posts; only the author writes them.
create policy comments_select_visible on public.comments
  for select to authenticated
  using (
    (deleted_at is null or author_id = (select auth.uid()))
    and exists (
      select 1
      from public.posts p
      where p.id = comments.post_id
        and (p.deleted_at is null or p.author_id = (select auth.uid()))
    )
  );

create policy comments_insert_own on public.comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1
      from public.posts p
      where p.id = comments.post_id
        and p.deleted_at is null
    )
  );

create policy comments_update_own on public.comments
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy comments_delete_own on public.comments
  for delete to authenticated
  using (author_id = (select auth.uid()));

-- Likes and saves: a user may see and change only their own rows; the public
-- counts live on posts and are maintained by triggers.
create policy post_likes_select_own on public.post_likes
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy post_likes_insert_own on public.post_likes
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.posts p
      where p.id = post_likes.post_id
        and p.deleted_at is null
    )
  );

create policy post_likes_delete_own on public.post_likes
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy comment_likes_select_own on public.comment_likes
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy comment_likes_insert_own on public.comment_likes
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.comments c
      join public.posts p on p.id = c.post_id
      where c.id = comment_likes.comment_id
        and c.deleted_at is null
        and p.deleted_at is null
    )
  );

create policy comment_likes_delete_own on public.comment_likes
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy post_saves_select_own on public.post_saves
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy post_saves_insert_own on public.post_saves
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.posts p
      where p.id = post_saves.post_id
        and p.deleted_at is null
    )
  );

create policy post_saves_delete_own on public.post_saves
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Follows: the graph is public, mutations are self-only.
create policy follows_select_authenticated on public.follows
  for select to authenticated
  using (true);

create policy follows_insert_own on public.follows
  for insert to authenticated
  with check (follower_id = (select auth.uid()));

create policy follows_delete_own on public.follows
  for delete to authenticated
  using (follower_id = (select auth.uid()));

-- Notifications: read-only to the recipient, who may mark them read.
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (recipient_id = (select auth.uid()));

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

-- Conversations and messages: members only. Creation goes through
-- get_or_create_direct_conversation().
create policy conversations_select_member on public.conversations
  for select to authenticated
  using ((select public.is_conversation_member(id)));

create policy conversation_members_select_member on public.conversation_members
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_conversation_member(conversation_id))
  );

create policy conversation_members_update_own on public.conversation_members
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy messages_select_member on public.messages
  for select to authenticated
  using ((select public.is_conversation_member(conversation_id)));

create policy messages_insert_member on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and (select public.is_conversation_member(conversation_id))
  );

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

-- Start from nothing, then grant exactly what the client needs. `anon` gets
-- no access at all; `service_role` keeps its own elevated privileges.
revoke all on
  public.profiles,
  public.posts,
  public.comments,
  public.comment_likes,
  public.post_likes,
  public.post_saves,
  public.follows,
  public.notifications,
  public.conversations,
  public.conversation_members,
  public.messages
from anon, authenticated;

grant usage on schema public to authenticated;

grant select on public.profiles to authenticated;
grant update (username, display_name, avatar_url, bio) on public.profiles to authenticated;

grant select, delete on public.posts to authenticated;
grant insert (author_id, type, caption, media_url, thumbnail_url, duration_seconds)
  on public.posts to authenticated;
grant update (caption, media_url, thumbnail_url, type, duration_seconds, deleted_at)
  on public.posts to authenticated;

grant select, delete on public.comments to authenticated;
grant insert (post_id, author_id, parent_id, body) on public.comments to authenticated;
grant update (body, deleted_at) on public.comments to authenticated;

grant select, delete on public.post_likes to authenticated;
grant insert (user_id, post_id) on public.post_likes to authenticated;

grant select, delete on public.comment_likes to authenticated;
grant insert (user_id, comment_id) on public.comment_likes to authenticated;

grant select, delete on public.post_saves to authenticated;
grant insert (user_id, post_id) on public.post_saves to authenticated;

grant select, delete on public.follows to authenticated;
grant insert (follower_id, following_id) on public.follows to authenticated;

grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

grant select on public.conversations to authenticated;

grant select on public.conversation_members to authenticated;
grant update (last_read_at) on public.conversation_members to authenticated;

grant select on public.messages to authenticated;
grant insert (conversation_id, sender_id, body) on public.messages to authenticated;

revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_conversation_member(uuid) to authenticated;

revoke all on function public.get_or_create_direct_conversation(uuid) from public;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

-- Trigger functions are never called directly by clients.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.sync_post_like_count() from public, anon, authenticated;
revoke all on function public.sync_post_save_count() from public, anon, authenticated;
revoke all on function public.sync_comment_count() from public, anon, authenticated;
revoke all on function public.sync_comment_like_count() from public, anon, authenticated;
revoke all on function public.sync_follow_counts() from public, anon, authenticated;
revoke all on function public.touch_conversation() from public, anon, authenticated;
revoke all on function public.notify_on_like() from public, anon, authenticated;
revoke all on function public.notify_on_comment() from public, anon, authenticated;
revoke all on function public.notify_on_follow() from public, anon, authenticated;
