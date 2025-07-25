# Usa una imagen oficial de PHP con Apache
FROM php:8.2-apache

# Instala las extensiones necesarias para MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copia el código fuente al contenedor
COPY . /var/www/html

# Habilita mod_rewrite de Apache
RUN a2enmod rewrite

# Establece el directorio de trabajo
WORKDIR /var/www/html

# Instala dependencias de Composer
RUN composer install

# Expone el puerto 80
EXPOSE 80

# Configura Apache para servir desde /publico
ENV APACHE_DOCUMENT_ROOT /var/www/html/publico
RUN sed -ri -e 's!/var/www/html!/var/www/html/publico!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!/var/www/html/publico/!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Comando de inicio
CMD ["apache2-foreground"] 