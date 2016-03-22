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
    id int,
    k varchar(32),
    v varchar(64),
    primary key(id, k),
    foreign key(id) references history(id)
) DEFAULT CHARSET=utf8