create table history
(
    id int primary key auto_increment,
    userid varchar(16),
    proj varchar(32),
    rsrc varchar(32),
    tp varchar(16),
    tm timestamp
) DEFAULT CHARSET=utf8

create table result
(
    hid int,
    id varchar(32),
    res1 varchar(128),
    res2 varchar(256),
    primary key(hid, id),
    foreign key(hid) references history(id)
) DEFAULT CHARSET=utf8