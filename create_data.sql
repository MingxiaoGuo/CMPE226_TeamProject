insert into user values (1, 'm', 'guo', 'mg@sjsu.edu', 'm', '1', date(now()), '123', 'a', 'san jose', 'ca', '95110');
insert into category values(1, 'test', 'test category');
insert into service values(1, 'test', 'test video', 'image', 'this is a test', 'san jose', 'ca', 1, date(now()), 1);
insert into service values(2, 'test2', 'test2 video', 'image2', 'this is a test2', 'san jose', 'ca', 1, date(now()), 1);
insert into service values(3, 'test3', 'test3 video', 'image3', 'this is a test3', 'san jose', 'ca', 1, date(now()), 1);
insert into service values(4, 'test4', 'test4 video', 'image4', 'this is a test4', 'san jose', 'ca', 1, date(now()), 1);


insert into user values (10, 'annie', 'zhang', 'annie@sjsu.edu', 'annie', 'f', date(now()), '510-666-8888', 'Market Street', 'San Francisco',
 'CA', '95110');

 delete from category where category_id=1;

 insert into category values(1, 'Automotive', 'Automotive services');
 insert into category values(2, 'Computer', 'Computer services');
 insert into category values(3, 'Financial', 'Financial services');
 insert into category values(4, 'Household', 'Household services');
 insert into category values(5, 'Tutoring', 'Tutoring services');

  alter table service modify column title varchar(120) not null;


insert into service values(10, 'Professional eCommerce Android App Design and Development', 'video link', 'image link', 
	'We are a professional E-commerce web design team, offering custom graphic design, Magento e-commerce solutions, 
	responsive e-commerce design, SEO online marketing and more web services, to completely meet your business needs.
    Support and development for Magento Community. 
    Magento setup and installation. 
    Implementation of Magento templates. 
    Magento template customization', 
    'San Francisco', 'CA', 10, date(now()), 2);

insert into service values(11, 'Angel Investor needed for innovative product', 'video link', 'image link', 
	'OurCrowd is a world-leading equity based platform, built for accredited investors to provide venture capital funding for early-stage technology start ups. 
	Membership in the community is vetted and offered only to people who meet stringent accreditation criteria. ', 
    'San Francisco', 'CA', 10, date(now()), 3);

insert into service values(12, 'Toyota Master Technician', 'video link', 'image link', 
	'Toyota Master Technician provide car service ', 
    'San Francisco', 'CA', 10, date(now()), 1);


insert into favorite values (10,10);