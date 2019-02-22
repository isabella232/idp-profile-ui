start: deps
	docker-compose pull
	docker-compose up -d proxy

# TODO: do we need the ability to run the app locally in "production" mode from the dist folder?

deps:
	docker-compose run node npm install

dist: deps
	docker-compose run node npm run build

logs:
	docker-compose logs
	docker-compose exec idp cat /var/log/apache2/error.log
	
phpmyadmin:
	docker-compose up -d brokerPhpmyadmin profilePhpmyadmin
	
clean:
	docker-compose run node npm run clean
	docker-compose kill
	docker-compose rm -f
