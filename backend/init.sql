create table Users (
    id            int GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    username      varchar(200) unique not null,
    pass_hash     text not null,
    email         text unique not null,
    points        int default 0,
    primary key   (id)
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
    fat           float,  -- Per 100g
    sodium        float,  -- Per 100g
    carbohydrates float,  -- Per 100g
    fiber         float,  -- Per 100g
    sugars        float,  -- Per 100g
    protein       float,  -- Per 100g
    primary key   (id)
);

create table Recipes (
    id            int unique not null,
    name          varchar(200) not null,
    description   text not null,
    cuisine       int references Cuisines(id),
    meal_type     int references MealTypes(id),
    serving_size  int not null,
    uploader      int references Users(id) default 0,
    primary key   (id)
);

create table recipe_ingredients (
    recipe        int references Recipes(id) not null,
    ingredient    int references Ingredients(id) not null,
    quantity      float,  -- E.g. 2 Lemons
    grams         float,
    millilitres   float,
    primary key   (recipe, ingredient)
);

create table user_upvotes (
    r_id          int references Recipes(id) not null,
    u_id          int references Users(id) not null,
    primary key   (r_id, u_id)
);

create table user_bookmarks (
    u_id          int references Users(id) not null,
    r_id          int references Recipes(id) not null,
    primary key   (u_id, r_id)
);

create table user_recentlyViewed (
    u_id          int references Users(id) not null,
    r_id          int references Recipes(id) not null,
    primary key   (u_id, r_id)
);

create table Comments (
    c_id          int GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    r_id          int references Recipes(id) not null,
    u_id          int references Users(id) not null,
    description   text not null,
    parent        int references Comments(c_id),
    primary key   c_id
);

GRANT SELECT ON ALL TABLES IN SCHEMA public TO comp3900_user;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO comp3900_user;
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO comp3900_user;
GRANT DELETE ON ALL TABLES IN SCHEMA public TO comp3900_user;

-- Load information into the table
-- COPY cuisines FROM '/home/user/Documents/comp3900/sample/data/cuisines.csv' DELIMITER ',' CSV HEADER;
