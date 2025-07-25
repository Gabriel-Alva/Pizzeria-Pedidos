// Modelos/pedido.js
export class Pedido {
    constructor({ id, estado, total, items }) {
        this.id = id;
        this.estado = estado;
        this.total = total;
        this.items = items || [];
    }
} 