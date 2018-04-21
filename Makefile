.DEFAULT_GOAL := help
.PHONY: build tag push

help:
	@awk 'BEGIN {FS = ":.*?##] "} /^[0-9a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build:
	docker build -t halo_image .

tag:
	docker tag halo_image raykrow/halo:latest

login:
	docker login --username=raykrow

push:
	docker push raykrow/halo:latest
