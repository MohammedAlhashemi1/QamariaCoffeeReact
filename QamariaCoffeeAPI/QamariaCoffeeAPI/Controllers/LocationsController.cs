using Microsoft.AspNetCore.Mvc; // MVC core attributes and base classes
using Microsoft.EntityFrameworkCore; // EF Core async methods and EntityState
using QamariaCoffeeAPI.Models; // Location model and DbContext

namespace QamariaCoffeeAPI.Controllers
{
    [ApiController] // enables automatic model validation and binding
    [Route("api/[controller]")] // route: api/locations
    public class LocationsController : ControllerBase // ControllerBase for APIs (no View support)
    {
        private readonly QamariaCoffeeDbContext _context; // database context injected via DI

        public LocationsController(QamariaCoffeeDbContext context) // constructor injection
        {
            _context = context; // store the context for use in actions
        }

        [HttpGet] // GET api/locations
        public async Task<ActionResult<IEnumerable<Location>>> GetLocations()
        {
            return await _context.Locations.ToListAsync(); // fetch all locations from the database
        }

        [HttpGet("{id}")] // GET api/locations/{id}
        public async Task<ActionResult<Location>> GetLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id); // look up location by primary key
            if (location == null) return NotFound(); // return 404 if not found
            return location; // return 200 with location data
        }

        [HttpPost] // POST api/locations
        public async Task<ActionResult<Location>> CreateLocation(Location location)
        {
            _context.Locations.Add(location); // add new location to the change tracker
            await _context.SaveChangesAsync(); // persist to the database
            return CreatedAtAction(nameof(GetLocation), new { id = location.LocationId }, location); // return 201 with location header
        }

        [HttpPut("{id}")] // PUT api/locations/{id}
        public async Task<IActionResult> UpdateLocation(int id, Location location)
        {
            if (id != location.LocationId) return BadRequest(); // id in URL must match body

            _context.Entry(location).State = EntityState.Modified; // mark entire entity as modified

            try
            {
                await _context.SaveChangesAsync(); // save changes to the database
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Locations.Any(e => e.LocationId == id)) return NotFound(); // location was deleted before update
                throw; // re-throw if it's a real concurrency conflict
            }

            return NoContent(); // return 204 on successful update
        }

        [HttpDelete("{id}")] // DELETE api/locations/{id}
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id); // find location to delete
            if (location == null) return NotFound(); // return 404 if not found

            _context.Locations.Remove(location); // mark for deletion
            await _context.SaveChangesAsync(); // commit deletion to the database
            return NoContent(); // return 204 on success
        }
    }
}
