using Microsoft.AspNetCore.Mvc; // MVC core attributes and base classes
using Microsoft.EntityFrameworkCore; // EF Core async methods and EntityState
using QamariaCoffeeAPI.Models; // Customer model and DbContext

namespace QamariaCoffeeAPI.Controllers
{
    [ApiController] // enables automatic model validation and binding
    [Route("api/[controller]")] // route: api/customers
    public class CustomersController : ControllerBase // ControllerBase for APIs (no View support)
    {
        private readonly QamariaCoffeeDbContext _context; // database context injected via DI

        public CustomersController(QamariaCoffeeDbContext context) // constructor injection
        {
            _context = context; // store the context for use in actions
        }

        [HttpGet] // GET api/customers
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return await _context.Customers.ToListAsync(); // fetch all customers from the database
        }

        [HttpGet("{id}")] // GET api/customers/{id}
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id); // look up customer by primary key
            if (customer == null) return NotFound(); // return 404 if not found
            return customer; // return 200 with customer data
        }

        [HttpPost] // POST api/customers
        public async Task<ActionResult<Customer>> CreateCustomer(Customer customer)
        {
            _context.Customers.Add(customer); // add new customer to the change tracker
            await _context.SaveChangesAsync(); // persist to the database
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.CustomerId }, customer); // return 201 with location header
        }

        [HttpPut("{id}")] // PUT api/customers/{id}
        public async Task<IActionResult> UpdateCustomer(int id, Customer customer)
        {
            if (id != customer.CustomerId) return BadRequest(); // id in URL must match body

            _context.Entry(customer).State = EntityState.Modified; // mark entire entity as modified

            try
            {
                await _context.SaveChangesAsync(); // save changes to the database
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Customers.Any(e => e.CustomerId == id)) return NotFound(); // customer was deleted before update
                throw; // re-throw if it's a real concurrency conflict
            }

            return NoContent(); // return 204 on successful update
        }

        [HttpDelete("{id}")] // DELETE api/customers/{id}
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id); // find customer to delete
            if (customer == null) return NotFound(); // return 404 if not found

            _context.Customers.Remove(customer); // mark for deletion
            await _context.SaveChangesAsync(); // commit deletion to the database
            return NoContent(); // return 204 on success
        }
    }
}
