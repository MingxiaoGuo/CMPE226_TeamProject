alter table service modify column description varchar(10000) not null;
alter table review modify column comment varchar(10000) not null;

select * from service natural join category where city = 'San Francisco';
select * from service where city = 'San Francisco';
select * from category;
select * from user;
select * from review;

insert into review values(2, 3, date(now()), 'good service', 5);
insert into review values(1, 3, date(now()), 'fair service', 3);

UPDATE `wantyou`.`review` 
SET 
    `comment` = 'I also had the leaking fitting that was mentioned by others, but when I found it hard to remove, I realized I must have cross-threaded it. The metal pipe that you attach a plastic fitting to that then attaches to the hose has sharp, machine-cut pipe threads. It\'s easy to get the plastic slightly cross-threaded so it\'s not straight enough to seal against the rubber washer. This fitting is only put on once, then it\'s left on. When it\'s on straight, it does not leak at all.';

select s.title, s.time 'post time', c.category_name, s.city, s.description, u.fname, u.phone, u.email, r.comment, r.time  'comment time', avg(rate) avgrate
from service as s, user as u, category as c, review as r 
where s.category_id = c.category_id and u.user_id = s.user_id and r.service_id = s.service_id and s.service_id = 3;

select u.fname, r.time, r.comment, r.rate
from review as r, service as s, user as u
where r.service_id = s.service_id and u.user_id = s.user_id and s.service_id = 3;