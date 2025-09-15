NAME = ft_transcendence

SECRETS_DIR = secrets
SECRETS_FILES = \
	cert.pem \
	key.pem

SECRETS = $(addprefix $(SECRETS_DIR)/, $(SECRETS_FILES))

COMPOSE = docker compose
MKDIR = mkdir -p
NPM = npm
OPENSSL = openssl
RM = rm -rf

.DEFAULT_GOAL = all

$(NAME): $(SECRETS)
	$(COMPOSE) up --build

%/cert.pem %/key.pem:
	@$(MKDIR) $(@D)
	$(OPENSSL) req -x509 -newkey rsa:4096 -keyout $(@D)/key.pem -out $(@D)/cert.pem -sha256 -days 397 -nodes -subj "/CN=localhost"

dist: node_modules FORCE
	$(NPM) run build:client

node_modules: package.json package-lock.json
	$(NPM) install

all: $(NAME)

dev dev\:s: node_modules FORCE
	$(NPM) run $@

down:
	$(COMPOSE) down

clean:
	$(RM) build dist tsconfig.tsbuildinfo
	$(COMPOSE) down --remove-orphans

fclean:
	$(RM) build data dist node_modules $(SECRETS_DIR) tsconfig.tsbuildinfo
	$(COMPOSE) down --remove-orphans --rmi all -v

re: fclean all

FORCE:

.PHONY: $(NAME) all dev dev\:s down clean fclean re FORCE
