-- create domain email_address check (
--    value ~ '^\w+@+\w+(?:\.\w)?.+\w' -- Fix this later to suit email addresses... maybe?
-- );

create table Users (
    id            int unique not null,
    username      varchar(200) unique not null,
    pass_hash     varchar(256) not null,
    -- email         email_address not null,
    email         text not null,
    points        int default 0,
    primary key  (id)
);

create table Cuisines (
    id            int unique not null,
    name          text unique not null,
    primary key   (id)
);

create table MealTypes (
    id            int unique not null,
    name          text unique not null,
    primary key   (id)
);

create table Ingredients (
    id            int unique not null,
    name          text unique not null,
    calories      float,  -- Per 100g
    primary key   (id)
);

create table Recipes (
    id            int unique not null,
    name          varchar(200) not null,
    description   text not null,
    cuisine       int references Cuisines(id),
    meal_type     int references MealTypes(id),
    serving_size  int not null,
    primary key   (id)
);

create table recipe_ingredients (
    recipe        int references Recipes(id),
    ingredient    int references Ingredients(id),
    quantity      float,  -- E.g. 2 Lemons
    grams         float,
    millilitres   float,
    primary key   (recipe, ingredient)
);
