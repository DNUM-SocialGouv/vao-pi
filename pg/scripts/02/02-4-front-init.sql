DROP SCHEMA IF EXISTS front CASCADE;           -- données spécifiques au portail usagers
CREATE SCHEMA front;

CREATE TYPE user_status AS ENUM (
  'NEED_EMAIL_VALIDATION',
  'VALIDATED',
  'BLOCKED'
);

/*==============================================================*/
/* Table : users                                                */
/*==============================================================*/
create table front.users (
   id                           SERIAL               NOT NULL,
   mail                         VARCHAR(320)         UNIQUE NULL,
   pwd                          VARCHAR(255)         DEFAULT NULL,
   nom                          VARCHAR(128)          NOT NULL,
   prenom                       VARCHAR(128)          NOT NULL,
   telephone                    VARCHAR(12)          NOT NULL,
   status_code                  user_status          NOT NULL,
   deleted                      BOOLEAN              NOT NULL DEFAULT false,
   verified                     timestamp            DEFAULT current_timestamp NOT NULL,
   created_at                   timestamp            DEFAULT current_timestamp NOT NULL,
   edited_at                    timestamp            DEFAULT current_timestamp NOT NULL,
   constraint pk_users primary key (id)
);

/*==============================================================*/
/* Table : sessions                                             */
/*==============================================================*/
create table front.sessions (
   id                   SERIAL               NOT NULL,
   cle                  VARCHAR(50)          NOT NULL,
   refresh_token        VARCHAR(200)         NOT NULL,
   created_at           TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_session primary key (refresh_token)
);

/*==============================================================*/
/* Table : operateur                                            */
/*==============================================================*/
create table front.operateurs (
   id                           SERIAL               NOT NULL,
   supprime                     BOOLEAN              NOT NULL DEFAULT false,
   complet                      BOOLEAN              NOT NULL DEFAULT false,
   type_operateur               VARCHAR(20)          NOT NULL DEFAULT 'personne_morale',
   personne_morale              JSONB                ,
   personne_physique            JSONB                ,
   protocole_transport          JSONB                ,
   protocole_sanitaire          JSONB                ,
   created_at                   TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   edited_at                    TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_operateurs    primary key (id)
);

/*==============================================================*/
/* Table : user_operateur                                       */
/*==============================================================*/
create table front.user_operateur (
   use_id                       INTEGER              UNIQUE NOT NULL REFERENCES front.users(id) ON DELETE CASCADE,
   ope_id                       INTEGER              NOT NULL REFERENCES front.operateurs(id) ON DELETE CASCADE,
   constraint pk_user_operateur primary key (use_id,ope_id)
);

/*==============================================================*/
/* Table : agrements				                                  */
/*==============================================================*/
CREATE TABLE front.agrements (
   id                            SERIAL                  NOT NULL,
   operateur_id                  INTEGER                 NOT NULL REFERENCES front.operateurs(id),
	uuid                      		uuid              		NOT NULL,
   supprime                      BOOLEAN                 NOT NULL DEFAULT false,
	numero                        VARCHAR(10)             NOT NULL,
   filename                      VARCHAR(50)             NOT NULL,
   region_delivrance             VARCHAR(4)              NOT NULL,
   date_obtention                DATE                    NOT NULL,
   date_fin_validite             DATE                    NOT NULL,
   created_at                   TIMESTAMP                DEFAULT current_timestamp NOT NULL,
   constraint pk_agrements primary key (uuid)
);
CREATE TYPE sejour_status AS ENUM (
   'BROUILLON',
   'TRANSMISE',
   'EN COURS',
   'A MODIFIER',
   'EN ATTENTE VALIDATION HEBERGEMENT',
   'EN ATTENTE DECLARATION 8 JOURS',
   'TRANSMISE 8J',
   'VALIDEE',
   'REFUSEE',
   'MAJ POST 8J'
);

/*==============================================================*/
/* Table : demande_sejour                                       */
/*==============================================================*/
create table front.demande_sejour (
   id                           SERIAL               NOT NULL,
   statut                       sejour_status        NOT NULL,
   departement_suivi            VARCHAR(3)           REFERENCES geo.territoires(code),
   operateur_id                 INTEGER              NOT NULL REFERENCES front.operateurs(id),
   id_fonctionnelle             VARCHAR(10)          ,
   libelle                      VARCHAR(50)          NOT NULL,
   date_debut                   DATE                 NOT NULL,
   date_fin                     DATE                 NOT NULL,
   duree                        INTEGER              DEFAULT 1 NOT NULL,
   periode                      VARCHAR(10)          NOT NULL,
   nb_hebergement               INTEGER              ,
   organisme                    JSONB                ,
   hebergement                  JSONB                ,
   vacanciers                   JSONB                ,
   personnel                    JSONB                ,
   transport                    JSONB                ,
   projet_sejour                JSONB                ,
   sanitaires                   JSONB                ,
   created_at                   TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   edited_at                    TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_demande_sejour primary key (id)
);

/*==============================================================*/
/* Table : demande_sejour                                       */
/*==============================================================*/
create table front.hebergement (
   id                           SERIAL               NOT NULL,
   supprime                     BOOLEAN              NOT NULL DEFAULT false,
   user_id                      INTEGER              NOT NULL REFERENCES front.users(id),
   nom                          VARCHAR(80)          NOT NULL,
   caracteristiques             JSONB                ,
   created_at                   TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   edited_at                    TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_hebergement primary key (id)
);

/*==============================================================*/
/* Table : demande_sejour_history                               */
/*==============================================================*/
create table front.demande_sejour_history (
   id                           SERIAL               NOT NULL,
   source                       VARCHAR(80)          NOT NULL,
   demande_sejour_id            INTEGER              NOT NULL REFERENCES front.demande_sejour(id),
   usager_user_id               INTEGER              REFERENCES front.users(id),
   bo_user_id                   INTEGER              REFERENCES back.users(id),
   type                         VARCHAR(80)          NOT NULL,
   type_precision               VARCHAR(80)          ,
   metadata                     JSONB                ,
   created_at                   TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   edited_at                    TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_demande_sejour_history primary key (id)
);


GRANT USAGE ON SCHEMA front TO vao;

GRANT ALL ON ALL TABLES IN SCHEMA front TO vao;
GRANT ALL ON ALL SEQUENCES IN SCHEMA front TO vao;
