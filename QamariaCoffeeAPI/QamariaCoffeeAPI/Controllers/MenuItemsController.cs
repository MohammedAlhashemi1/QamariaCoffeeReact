using Microsoft.AspNetCore.Mvc; // MVC core attributes and base classes
using Microsoft.EntityFrameworkCore; // EF Core async methods and EntityState
using QamariaCoffeeAPI.Models; // MenuItem model and DbContext

namespace QamariaCoffeeAPI.Controllers
{
    [ApiController] // enables automatic model validation and binding
    [Route("api/[controller]")] // route: api/menuitems
    public class MenuItemsController : ControllerBase // ControllerBase for APIs (no View support)
    {
        private readonly QamariaCoffeeDbContext _context; // database context injected via DI

        public MenuItemsController(QamariaCoffeeDbContext context) // constructor injection
        {
            _context = context; // store the context for use in actions
        }

        [HttpGet] // GET api/menuitems
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetMenuItems()
        {
            return await _context.MenuItems.ToListAsync(); // fetch all menu items from the database
        }

        [HttpGet("{id}")] // GET api/menuitems/{id}
        public async Task<ActionResult<MenuItem>> GetMenuItem(int id)
        {
            var item = await _context.MenuItems.FindAsync(id); // look up item by primary key
            if (item == null) return NotFound(); // return 404 if not found
            return item; // return 200 with item data
        }

        [HttpPost] // POST api/menuitems
        public async Task<ActionResult<MenuItem>> CreateMenuItem(MenuItem item)
        {
            _context.MenuItems.Add(item); // add new menu item to the change tracker
            await _context.SaveChangesAsync(); // persist to the database
            return CreatedAtAction(nameof(GetMenuItem), new { id = item.ItemId }, item); // return 201 with location header
        }

        [HttpPut("{id}")] // PUT api/menuitems/{id}
        public async Task<IActionResult> UpdateMenuItem(int id, MenuItem item)
        {
            if (id != item.ItemId) return BadRequest(); // id in URL must match body

            _context.Entry(item).State = EntityState.Modified; // mark entire entity as modified

            try
            {
                await _context.SaveChangesAsync(); // save changes to the database
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.MenuItems.Any(e => e.ItemId == id)) return NotFound(); // item was deleted before update
                throw; // re-throw if it's a real concurrency conflict
            }

            return NoContent(); // return 204 on successful update
        }

        [HttpDelete("{id}")] // DELETE api/menuitems/{id}
        public async Task<IActionResult> DeleteMenuItem(int id)
        {
            var item = await _context.MenuItems.FindAsync(id); // find item to delete
            if (item == null) return NotFound(); // return 404 if not found

            _context.MenuItems.Remove(item); // mark for deletion
            await _context.SaveChangesAsync(); // commit deletion to the database
            return NoContent(); // return 204 on success
        }
    }
}
