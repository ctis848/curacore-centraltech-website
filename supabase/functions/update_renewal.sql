create or replace function public.extend_renewal(user_id uuid, amount numeric)
returns void
language plpgsql
as $$
declare
  current_date date;
  new_date date;
begin
  select next_renewal_date into current_date
  from ClientBilling
  where userId = user_id;

  if current_date is null or current_date <= now() then
    new_date := (now() + interval '1 year')::date;
  else
    new_date := (current_date + interval '1 year')::date;
  end if;

  update ClientBilling
  set annual_fee = amount,
      next_renewal_date = new_date,
      updated_at = now()
  where userId = user_id;
end;
$$;
