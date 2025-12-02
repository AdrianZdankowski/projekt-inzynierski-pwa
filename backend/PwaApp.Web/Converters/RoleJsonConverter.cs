using System.Text.Json;
using System.Text.Json.Serialization;
using WebApplication1;

namespace backend.Converters
{
    public class RoleJsonConverter : JsonConverter<Role>
    {
        public override Role Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (string.IsNullOrEmpty(value))
            {
                throw new JsonException("Role value cannot be null or empty");
            }
            
            return Role.FromString(value);
        }

        public override void Write(Utf8JsonWriter writer, Role value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToStringValue());
        }
    }
}

