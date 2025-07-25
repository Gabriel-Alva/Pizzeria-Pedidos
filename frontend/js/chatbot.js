// Chatbot flotante Paladar del Inca (procesamiento local, menú dinámico)

document.addEventListener('DOMContentLoaded', () => {
  // Elementos
  const fab = document.getElementById('chatbot-fab');
  const windowEl = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const bodyEl = document.getElementById('chatbot-body');
  const inputEl = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');

  // Opciones rápidas
  const quickOptions = [
    { label: 'Menú', value: 'Menú', isMenu: true },
    { label: 'Recomendaciones', value: 'Recomendaciones', isRecom: true },
    { label: 'Promociones', value: 'Promociones' },
    { label: 'Delivery', value: '¿Tienen delivery?' },
    { label: 'Ubicación', value: 'Ubicación' },
    { label: 'Horario', value: 'Horario' },
    { label: 'Estado de mi pedido', value: 'Estado de mi pedido' }
  ];

  // Mostrar/ocultar ventana
  function openChat() {
    windowEl.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
    windowEl.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
    inputEl.focus();
  }
  function closeChat() {
    windowEl.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
    windowEl.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
  }
  fab.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  // Enviar mensaje
  sendBtn.addEventListener('click', () => handleUserInput());
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleUserInput();
  });

  // Lógica de respuestas (igual a ServicioLogicaChatbot, con delivery y promociones)
  function getBotReply(msg) {
    const mensajeUsuario = msg.trim().toLowerCase();
    if (mensajeUsuario.includes('hola') || mensajeUsuario.includes('saludos')) {
      return "¡Hola! ¿En qué puedo ayudarte hoy?";
    } else if (mensajeUsuario.includes('menú') || mensajeUsuario.includes('menu') || mensajeUsuario.includes('pizzas')) {
      return "menu_dinamico"; // Señal para mostrar menú dinámico
    } else if (mensajeUsuario.includes('promocion') || mensajeUsuario.includes('promoción') || mensajeUsuario.includes('oferta')) {
      return "¡Tenemos promociones especiales los fines de semana! Consulta la sección de promociones en la web o pregunta por nuestras ofertas del día.";
    } else if (mensajeUsuario.includes('delivery')) {
      return "¡Sí! Ofrecemos servicio de delivery en toda la ciudad. Haz tu pedido y elige la opción de entrega a domicilio.";
    } else if (mensajeUsuario.includes('pedido') || mensajeUsuario.includes('estado')) {
      return "Para consultar el estado de tu pedido, por favor ve a la sección 'Mis Pedidos' y busca tu número de pedido.";
    } else if (mensajeUsuario.includes('dirección') || mensajeUsuario.includes('direccion') || mensajeUsuario.includes('ubicacion') || mensajeUsuario.includes('ubicación')) {
      return "Estamos ubicados en Av. Siempre Viva 742. ¡Te esperamos!";
    } else if (mensajeUsuario.includes('horario') || mensajeUsuario.includes('abren')) {
      return "Nuestro horario de atención es de Lunes a Domingo, de 12:00 PM a 11:00 PM.";
    } else if (mensajeUsuario.includes('gracias') || mensajeUsuario.includes('adios') || mensajeUsuario.includes('adiós')) {
      return "De nada. ¡Que tengas un gran día!";
    } else {
      return "Lo siento, no entiendo tu pregunta. ¿Podrías reformularla o preguntar algo sobre nuestro menú, promociones, delivery o pedidos?";
    }
  }

  // Mostrar mensaje en el chat
  function addMessage(text, sender = 'bot', showOptions = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col ' + (sender === 'user' ? 'items-end' : 'items-start');
    const msgDiv = document.createElement('div');
    msgDiv.className = `rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm mb-1 ${
      sender === 'user' ? 'bg-yellow-100 text-gray-900 self-end' : 'bg-gray-200 text-gray-800 self-start'
    }`;
    msgDiv.textContent = text;
    wrapper.appendChild(msgDiv);

    // Si showOptions, mostrar botones debajo del mensaje
    if (showOptions) {
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'flex flex-wrap gap-2 mt-1';
      quickOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.className = 'bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-full px-4 py-1 transition-all duration-150 shadow';
        btn.onclick = () => {
          addMessage(opt.value, 'user');
          if (opt.isMenu) {
            showMenuDinamico();
            return;
          }
          if (opt.isRecom) {
            showRecomendaciones();
            return;
          }
          setTimeout(() => {
            const reply = getBotReply(opt.value);
            const showAgain = reply.startsWith('Lo siento');
            if (reply === 'menu_dinamico') {
              showMenuDinamico();
            } else {
              addMessage(reply, 'bot', showAgain);
            }
          }, 400);
        };
        optionsDiv.appendChild(btn);
      });
      wrapper.appendChild(optionsDiv);
    }

    bodyEl.appendChild(wrapper);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  // Mostrar menú dinámico de pizzas
  async function showMenuDinamico() {
    // Mensaje de carga
    addMessage('Consultando el menú de pizzas...', 'bot');
    try {
      const res = await fetch('https://api-gateway-zfzn.onrender.com/productos/pizzas');
      if (!res.ok) throw new Error('No se pudo obtener el menú');
      const pizzas = await res.json();
      if (!Array.isArray(pizzas) || pizzas.length === 0) {
        addMessage('No hay pizzas disponibles en este momento.', 'bot', true);
        return;
      }
      // Encabezado del menú
      const menuHeader = document.createElement('div');
      menuHeader.className = 'font-semibold text-yellow-700 mb-2';
      menuHeader.textContent = 'Estas son nuestras pizzas disponibles:';
      bodyEl.appendChild(menuHeader);
      // Lista de pizzas
      pizzas.forEach(pizza => {
        const pizzaDiv = document.createElement('div');
        pizzaDiv.className = 'mb-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100 shadow-sm flex items-start gap-3';
        // Imagen o ícono
        let imgOrIcon = null;
        if (pizza.url_imagen) {
          imgOrIcon = document.createElement('img');
          imgOrIcon.src = pizza.url_imagen;
          imgOrIcon.alt = pizza.nombre;
          imgOrIcon.className = 'w-10 h-10 object-cover rounded-full border border-yellow-300 bg-white flex-shrink-0';
        } else {
          imgOrIcon = document.createElement('span');
          imgOrIcon.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='w-8 h-8 text-yellow-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 3c-4.97.17-9.17 2.1-12.02 4.95C5.1 9.83 3.17 14.03 3 19c4.97-.17 9.17-2.1 12.02-4.95C18.9 14.17 20.83 9.97 21 5z' /><circle cx='15.5' cy='8.5' r='1.5' fill='currentColor'/><circle cx='11.5' cy='12.5' r='1.5' fill='currentColor'/></svg>`;
          imgOrIcon.className = 'flex-shrink-0';
        }
        pizzaDiv.appendChild(imgOrIcon);
        // Contenido textual
        const contentDiv = document.createElement('div');
        // Nombre y precio
        const namePrice = document.createElement('div');
        namePrice.innerHTML = `<span class='font-bold text-gray-800'>${pizza.nombre}</span> <span class='text-yellow-600 font-semibold'>- $${Number(pizza.precio).toFixed(2)}</span>`;
        contentDiv.appendChild(namePrice);
        // Descripción
        if (pizza.descripcion) {
          const desc = document.createElement('div');
          desc.className = 'text-gray-600 text-sm mt-1';
          desc.textContent = pizza.descripcion;
          contentDiv.appendChild(desc);
        }
        pizzaDiv.appendChild(contentDiv);
        bodyEl.appendChild(pizzaDiv);
      });
      // Opciones rápidas al final
      const optionsWrapper = document.createElement('div');
      optionsWrapper.className = 'flex flex-wrap gap-2 mt-2';
      quickOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.className = 'bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-full px-4 py-1 transition-all duration-150 shadow';
        btn.onclick = () => {
          addMessage(opt.value, 'user');
          if (opt.isMenu) {
            showMenuDinamico();
            return;
          }
          if (opt.isRecom) {
            showRecomendaciones();
            return;
          }
          setTimeout(() => {
            const reply = getBotReply(opt.value);
            const showAgain = reply.startsWith('Lo siento');
            if (reply === 'menu_dinamico') {
              showMenuDinamico();
            } else {
              addMessage(reply, 'bot', showAgain);
            }
          }, 400);
        };
        optionsWrapper.appendChild(btn);
      });
      bodyEl.appendChild(optionsWrapper);
      bodyEl.scrollTop = bodyEl.scrollHeight;
    } catch (err) {
      addMessage('Hubo un error al consultar el menú. Intenta más tarde.', 'bot', true);
    }
  }

  // Mostrar recomendaciones de pizzas mejor calificadas
  async function showRecomendaciones() {
    addMessage('Buscando las pizzas mejor calificadas para ti...', 'bot');
    try {
      const res = await fetch('https://api-gateway-zfzn.onrender.com/usuarios/pizzas/mejor-calificadas');
      if (!res.ok) throw new Error('No se pudo obtener recomendaciones');
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        addMessage('No hay recomendaciones disponibles en este momento.', 'bot', true);
        return;
      }
      // Encabezado
      const header = document.createElement('div');
      header.className = 'font-semibold text-yellow-700 mb-2';
      header.textContent = 'Pizzas que te podrían gustar (mejor calificadas):';
      bodyEl.appendChild(header);
      // Mostrar cada pizza recomendada
      for (const pizza of data) {
        // Obtener los datos completos de la pizza (nombre, imagen, etc.)
        let pizzaInfo = null;
        try {
          const resPizza = await fetch(`https://servicio-productos.onrender.com/pizzas/${pizza.pizza_id}`);
          if (resPizza.ok) pizzaInfo = await resPizza.json();
        } catch {}
        const pizzaDiv = document.createElement('div');
        pizzaDiv.className = 'mb-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100 shadow-sm flex items-start gap-3';
        // Imagen o ícono
        let imgOrIcon = null;
        if (pizzaInfo && pizzaInfo.url_imagen) {
          imgOrIcon = document.createElement('img');
          imgOrIcon.src = pizzaInfo.url_imagen;
          imgOrIcon.alt = pizzaInfo.nombre;
          imgOrIcon.className = 'w-10 h-10 object-cover rounded-full border border-yellow-300 bg-white flex-shrink-0';
        } else {
          imgOrIcon = document.createElement('span');
          imgOrIcon.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='w-8 h-8 text-yellow-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 3c-4.97.17-9.17 2.1-12.02 4.95C5.1 9.83 3.17 14.03 3 19c4.97-.17 9.17-2.1 12.02-4.95C18.9 14.17 20.83 9.97 21 5z' /><circle cx='15.5' cy='8.5' r='1.5' fill='currentColor'/><circle cx='11.5' cy='12.5' r='1.5' fill='currentColor'/></svg>`;
          imgOrIcon.className = 'flex-shrink-0';
        }
        pizzaDiv.appendChild(imgOrIcon);
        // Contenido textual
        const contentDiv = document.createElement('div');
        // Nombre y promedio
        const nameScore = document.createElement('div');
        nameScore.innerHTML = `<span class='font-bold text-gray-800'>${pizzaInfo && pizzaInfo.nombre ? pizzaInfo.nombre : 'Pizza #' + pizza.pizza_id}</span> <span class='text-yellow-600 font-semibold'>⭐ ${pizza.promedio ? Number(pizza.promedio).toFixed(2) : 'N/A'}</span>`;
        contentDiv.appendChild(nameScore);
        // Descripción
        if (pizzaInfo && pizzaInfo.descripcion) {
          const desc = document.createElement('div');
          desc.className = 'text-gray-600 text-sm mt-1';
          desc.textContent = pizzaInfo.descripcion;
          contentDiv.appendChild(desc);
        }
        pizzaDiv.appendChild(contentDiv);
        bodyEl.appendChild(pizzaDiv);
      }
      // Opciones rápidas al final
      const optionsWrapper = document.createElement('div');
      optionsWrapper.className = 'flex flex-wrap gap-2 mt-2';
      quickOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.className = 'bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-full px-4 py-1 transition-all duration-150 shadow';
        btn.onclick = () => {
          addMessage(opt.value, 'user');
          if (opt.isMenu) {
            showMenuDinamico();
            return;
          }
          if (opt.isRecom) {
            showRecomendaciones();
            return;
          }
          setTimeout(() => {
            const reply = getBotReply(opt.value);
            const showAgain = reply.startsWith('Lo siento');
            if (reply === 'menu_dinamico') {
              showMenuDinamico();
            } else {
              addMessage(reply, 'bot', showAgain);
            }
          }, 400);
        };
        optionsWrapper.appendChild(btn);
      });
      bodyEl.appendChild(optionsWrapper);
      bodyEl.scrollTop = bodyEl.scrollHeight;
    } catch (err) {
      addMessage('No se pudieron obtener recomendaciones. Intenta más tarde.', 'bot', true);
    }
  }

  // Manejar input usuario
  function handleUserInput() {
    const userMsg = inputEl.value.trim();
    if (!userMsg) return;
    addMessage(userMsg, 'user');
    if (userMsg.toLowerCase().includes('menú') || userMsg.toLowerCase().includes('menu') || userMsg.toLowerCase().includes('pizzas')) {
      showMenuDinamico();
      inputEl.value = '';
      return;
    }
    inputEl.value = '';
    setTimeout(() => {
      const reply = getBotReply(userMsg);
      // Si la respuesta es la de "no entiendo", volver a mostrar opciones
      const showAgain = reply.startsWith('Lo siento');
      if (reply === 'menu_dinamico') {
        showMenuDinamico();
      } else {
        addMessage(reply, 'bot', showAgain);
      }
    }, 400);
  }

  // Mensaje de bienvenida
  function showWelcome() {
    addMessage("¡Bienvenido! Soy el asistente de Paladar del Inca. ¿En qué puedo ayudarte hoy?", 'bot', true);
  }

  // Inicialización
  closeChat();
  showWelcome();
}); 