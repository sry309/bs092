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
    res1 varchar(16),
    res2 varchar(256),
    res3 varchar(16),
    res4 varchar(16),
    primary key(hid, id),
    foreign key(hid) references history(id)
) DEFAULT CHARSET=utf8

create table message
(
    id int primary key auto_increment,
    userid varchar(16),
    content varchar(64),
    tm timestamp,
    isread tinyint default 0
) DEFAULT CHARSET=utf8

create table email
(
    userid varchar(16) primary key,
    email varchar(32)
)DEFAULT CHARSET=utf8