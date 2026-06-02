using Microsoft.AspNetCore.Mvc; // MVC core attributes and base classes
using Microsoft.EntityFrameworkCore; // EF Core async methods and EntityState
using QamariaCoffeeAPI.Models; // Order model and DbContext

namespace QamariaCoffeeAPI.Controllers
{
    [ApiController] // enables automatic model validation and binding
    [Route("api/[controller]")] // route: api/orders
    public class OrdersController : ControllerBase // ControllerBase for APIs (no View support)
    {
        private readonly QamariaCoffeeDbContext _context; // database context injected via DI

        public OrdersController(QamariaCoffeeDbContext context) // constructor injection
        {
            _context = context; // store the context for use in actions
        }

        [HttpGet] // GET api/orders
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.Location)
                .Select(o => new // flatten to avoid circular reference
                {
                    orderId = o.OrderId,
                    orderDate = o.OrderDate,
                    paymentMethod = o.PaymentMethod,
                    status = o.Status,
                    customerName = o.Customer.FirstName + " " + o.Customer.LastName,
                    locationName = o.Location.LocationName
                })
                .ToListAsync();
            return Ok(orders);
        }

        [HttpGet("{id}")] // GET api/orders/{id}
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer) // eager load related customer
                .Include(o => o.Location) // eager load related location
                .Include(o => o.OrderItems) // eager load order items
                    .ThenInclude(oi => oi.Item) // then load each item's menu item details
                .FirstOrDefaultAsync(o => o.OrderId == id); // filter by id

            if (order == null) return NotFound(); // return 404 if not found
            return order; // return 200 with full order data
        }

        [HttpPost] // POST api/orders
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            order.OrderDate = DateTime.Now; // set order timestamp on the server side
            order.Status ??= "Pending"; // default status if not provided by the client

            _context.Orders.Add(order); // add new order to the change tracker
            await _context.SaveChangesAsync(); // persist to the database
            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, order); // return 201 with location header
        }

        [HttpPut("{id}")] // PUT api/orders/{id}
        public async Task<IActionResult> UpdateOrder(int id, Order order)
        {
            if (id != order.OrderId) return BadRequest(); // id in URL must match body

            _context.Entry(order).State = EntityState.Modified; // mark entire entity as modified

            try
            {
                await _context.SaveChangesAsync(); // save changes to the database
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Orders.Any(e => e.OrderId == id)) return NotFound(); // order was deleted before update
                throw; // re-throw if it's a real concurrency conflict
            }

            return NoContent(); // return 204 on successful update
        }

        [HttpDelete("{id}")] // DELETE api/orders/{id}
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id); // find order to delete
            if (order == null) return NotFound(); // return 404 if not found

            _context.Orders.Remove(order); // mark for deletion
            await _context.SaveChangesAsync(); // commit deletion to the database
            return NoContent(); // return 204 on success
        }
    }
}
