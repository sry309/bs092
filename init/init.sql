create table history
(
    id int primary key auto_increment,
    userid varchar(16),
    proj varchar(32),
    rsrc varchar(32),
    tp varchar(16),
    tm timestamp
)

create table result
(
    id int,
    k varchar(32),
    v varchar(32),
    primary key(id, k),
    foreign key(id) references history(id)
)