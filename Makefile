NAME = ft_transcendence

COMPOSE = docker compose
NPM = npm

RM = rm -rf
MKDIR = mkdir -p

.DEFAULT_GOAL = all

$(NAME):
	$(COMPOSE) up --build

node_modules: package.json package-lock.json
	$(NPM) install

all: $(NAME)

dev dev\:s: node_modules FORCE
	$(NPM) run $@

down:
	$(COMPOSE) down

clean:
	$(RM) build dist tsconfig.tsbuildinfo

fclean: clean
	$(RM) data node_modules

re: fclean all

FORCE:

.PHONY: $(NAME) all dev dev\:s down clean fclean re FORCE
