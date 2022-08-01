create table Users (
    id              int unique GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    username        varchar(200) unique not null,
    pass_hash       text not null,
    email           text unique not null,
    points          int default 0,
    primary key     (id)
);

create table Cuisines (
    id              int unique GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    name            text unique not null,
    primary key     (id)
);

create table MealTypes (
    id              int unique GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    name            text unique not null,
    primary key     (id)
);

create table Ingredients (
    id              int unique GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    name            text unique not null,
    energy          float default 0.0, -- (kJ)
    protein         float default 0.0, -- (g)
    fat             float default 0.0, -- (g)
    fibre           float default 0.0, -- (g)
    sugars          float default 0.0, -- (g)
    carbohydrates   float default 0.0, -- (g)
    calcium         float default 0.0, -- (mg)
    iron            float default 0.0, -- (mg)
    magnesium       float default 0.0, -- (mg)
    manganese       float default 0.0, -- (mg)
    phosphorus      float default 0.0, -- (mg)
    primary key     (id)
);

create table Recipes (
    id              int unique GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    name            varchar(200) not null,
    description     text not null,
    cuisine         int references Cuisines(id),
    mealType        int references MealTypes(id),
    servingSize     int not null,
    uploader        int references Users(id) default 0,
    instructions    text not null,
    primary key     (id)
);

create table Allergens (
    id              int unique GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    name            varchar(200) not null,
    primary key     (id)
);

create table recipe_ingredients (
    r_id            int references Recipes(id) not null,
    ingredient      int references Ingredients(id) not null,
    quantity        float,  -- E.g. 2 Lemons
    grams           float,
    millilitres     float,
    primary key     (r_id, ingredient)
);

create table user_bookmarks (
    u_id            int references Users(id) not null,
    r_id            int references Recipes(id) not null,
    primary key     (u_id, r_id)
);

create table user_recentlyViewed (
    u_id            int references Users(id) not null,
    r_id            int references Recipes(id) not null,
    primary key     (u_id, r_id)
);

create table Comments (
    c_id            int GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    r_id            int references Recipes(id) not null,
    u_id            int references Users(id) not null,
    description     text not null,
    parent          int references Comments(c_id),
    primary key     (c_id)
);

create table allergen_ingredients (
    i_id            int references Ingredients(id),
    a_id            int references Allergens(id),
    primary key     (i_id, a_id)
);

create table user_allergens (
    u_id            int references Users(id),
    a_id            int references Allergens(id),
    primary key     (u_id, a_id)
);

create table meal_history (
    m_his           int unique GENERATED ALWAYS AS IDENTITY (START WITH 1) not null,
    u_id            int references Users(id) not null,
    r_id            int references Recipes(id) not null,
    date            DATE not null,
    primary key     (m_his)
);

create table recipe_rating (
    u_id            int references Users(id) not null,
    r_id            int references Recipes(id) not null,
    rating          int not null default 0, -- Change this to be inbetween 1-5
    primary key     (u_id, r_id)
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
COPY user_bookmarks FROM '/var/lib/postgresql/comp3900/backend/data/user_bookmarks.csv' DELIMITER ',' CSV HEADER;
COPY user_recentlyViewed FROM '/var/lib/postgresql/comp3900/backend/data/user_recentlyviewed.csv' DELIMITER ',' CSV HEADER;
COPY Comments FROM '/var/lib/postgresql/comp3900/backend/data/comments.csv' DELIMITER ',' CSV HEADER;
COPY Allergens FROM '/var/lib/postgresql/comp3900/backend/data/allergens.csv' DELIMITER ',' CSV HEADER;
COPY allergen_ingredients FROM '/var/lib/postgresql/comp3900/backend/data/allergen_ingredients.csv' DELIMITER ',' CSV HEADER;
COPY meal_history FROM '/var/lib/postgresql/comp3900/backend/data/meal_history.csv' DELIMITER ',' CSV HEADER;
COPY user_allergens FROM '/var/lib/postgresql/comp3900/backend/data/user_allergens.csv' DELIMITER ',' CSV HEADER;
COPY recipe_rating FROM '/var/lib/postgresql/comp3900/backend/data/recipe_rating.csv' DELIMITER ',' CSV HEADER;
