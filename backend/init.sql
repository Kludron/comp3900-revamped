create table Users (
    id            int unique GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
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
    id            int unique GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
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
    mealType     int references MealTypes(id),
    servingSize  int not null,
    uploader      int references Users(id) default 0,
    primary key   (id)
);

create table recipe_ingredients (
    r_id        int references Recipes(id) not null,
    ingredient    int references Ingredients(id) not null,
    quantity      float,  -- E.g. 2 Lemons
    grams         float,
    millilitres   float,
    primary key   (r_id, ingredient)
);

create table user_upvotes (
    u_id          int references Users(id) not null,
    r_id          int references Recipes(id) not null,
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
    primary key   (c_id)
);

GRANT SELECT ON ALL TABLES IN SCHEMA public TO comp3900_user;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO comp3900_user;
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO comp3900_user;
GRANT DELETE ON ALL TABLES IN SCHEMA public TO comp3900_user;

-- Load information into the table
COPY Users FROM '/var/lib/postgresql/comp3900/backend/data/users.csv' DELIMITER ',' CSV HEADER;
COPY Cuisines FROM '/var/lib/postgresql/comp3900/backend/data/cuisines.csv' DELIMITER ',' CSV HEADER;
COPY MealTypes FROM '/var/lib/postgresql/comp3900/backend/data/mealtypes.csv' DELIMITER ',' CSV HEADER;
COPY Ingredients FROM '/var/lib/postgresql/comp3900/backend/data/ingredients.csv' DELIMITER ',' CSV HEADER;
COPY Recipes FROM '/var/lib/postgresql/comp3900/backend/data/recipes.csv' DELIMITER ',' CSV HEADER;
COPY recipe_ingredients FROM '/var/lib/postgresql/comp3900/backend/data/recipe_ingredients.csv' DELIMITER ',' CSV HEADER;
COPY user_upvotes FROM '/var/lib/postgresql/comp3900/backend/data/user_upvotes.csv' DELIMITER ',' CSV HEADER;
COPY user_bookmarks FROM '/var/lib/postgresql/comp3900/backend/data/user_bookmarks.csv' DELIMITER ',' CSV HEADER;
COPY user_recentlyViewed FROM '/var/lib/postgresql/comp3900/backend/data/user_recentlyviewed.csv' DELIMITER ',' CSV HEADER;
COPY Comments FROM '/var/lib/postgresql/comp3900/backend/data/comments.csv' DELIMITER ',' CSV HEADER;
