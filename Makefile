.DEFAULT_GOAL := help
.PHONY: build tag push

help:
	@awk 'BEGIN {FS = ":.*?##] "} /^[0-9a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build:
	docker build -t oakudo_halo_image .

tag:
	docker tag oakudo_halo_image 753307791632.dkr.ecr.us-west-2.amazonaws.com/halo:latest

push:
	docker push 753307791632.dkr.ecr.us-west-2.amazonaws.com/halo:latest
