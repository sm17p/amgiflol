# Code quality principles

Universal principles distilled from Kent Beck's Smalltalk Best Practice Patterns, generalized for any codebase. For **stack-specific commands, agent roles, and rules that conflict with these principles**, the nearest [`AGENTS.md`](../../../AGENTS.md) wins.

## 1. Composed Method

Divide every function into sub-functions that each perform one identifiable task. Keep all operations in a method at the same level of abstraction. This naturally produces many small methods, each a few lines long.

## 2. Intention-Revealing Names

Name methods and functions after what they accomplish, never how they accomplish it. A reader should understand the purpose of a call without reading its body.

## 3. Replace Comments with Clear Code

If a comment restates what the code does, delete it. If you cannot delete a comment, refactor the code (extract a well-named function, rename a variable) until the comment is redundant. Reserve comments for why, not what.

## 4. Constructor Clarity

Provide factory functions or constructors that create well-formed instances. Pass all required parameters upfront so callers never receive half-initialized objects.

## 5. Single Responsibility for Methods

Each method should have exactly one reason to change. If a method requires a paragraph to explain, it is doing too much.

## 6. Say Things Once and Only Once

Every piece of knowledge or logic should exist in exactly one place. Duplicate code is a multiple-update liability—extract it.

## 7. Behavior Over State

Get the behavior (public interface) right first. Internal representation can always change later if it is hidden behind a clean API. Optimizing data layout prematurely couples consumers to implementation details.

## 8. Intention-Revealing Selectors / Function Names

Name functions after the concept they represent, not the algorithm they use. `includes(item)` is better than `linearSearchFor(item)`. Imagine a second, very different implementation—would you give it the same name? If not, generalize.

## 9. Guard Clauses Over Deep Nesting

Handle edge cases and error conditions at the top of a function and return early. The main logic path should read without indentation.

## 10. Query Methods Return; Commands Mutate

Separate functions that answer questions (return a value, no side effects) from functions that change state. Name query methods with `is`, `has`, `can` prefixes for booleans.

## 11. Explaining Variables

When a complex expression is hard to read, assign its result to a well-named local variable. The variable name becomes the explanation.

## 12. Role-Suggesting Names

Name variables after the role they play, not their type. `employees` not `employeeList`; `query` not `queryString`. The type can be inferred from context.

## 13. Use Polymorphism Instead of Conditionals

When the same if/switch structure appears in multiple places, replace it with polymorphic objects that each implement one branch. Adding a new case becomes adding a new class, not editing existing code.

## 14. Delegate, Do Not Inherit (Prefer Composition)

Share implementation by passing work to a collaborator object rather than subclassing. Delegation keeps the two objects independently replaceable and avoids deep inheritance hierarchies.

## 15. Method Object for Complex Logic

When a method has grown huge and shares many temporaries, extract the entire computation into its own class. Turn parameters and temporaries into instance fields, put the logic in a `compute()`/`call()` method, then simplify with Composed Method.

## 16. Execute Around (Resource Bracketing)

When two actions must always happen together (open/close, lock/unlock, setup/teardown), expose a single function that accepts a callback. The caller never forgets the second action.

## 17. Explicit Initialization

Initialize all state at construction time. Never rely on callers to set fields in the right order after creation. If defaults exist, set them in the constructor.

## 18. Lazy Initialization

When computing or fetching a value is expensive and may not be needed, defer it to first access. Cache the result in a field and return it on subsequent calls.

## 19. Constant Methods / Named Constants

Replace magic literals with named constants or zero-argument methods. `MAX_RETRIES` communicates more than `5`, and a method lets subclasses override the value.

## 20. Indirect Variable Access (Encapsulate Fields)

Access instance fields through getter/setter methods rather than directly. This gives you a single place to add validation, logging, lazy init, or change notification later.

## 21. Collection Accessor Safety

Never return a raw mutable collection from a getter. Return a copy, an immutable view, or expose only domain-specific add/remove/enumerate methods.

## 22. Equality and Hashing Contract

If you override equality, override hashing to match. Objects that are equal must produce the same hash. Base both on the same set of fields.

## 23. Mediating Protocol

When two objects collaborate heavily, make the set of messages between them explicit and consistent. Name them coherently so a third party can implement the same interface.

## 24. Double Dispatch for Cross-Type Operations

When behaviour depends on the types of two objects (not just the receiver), use double dispatch: the receiver calls back the argument with a more specific method, including its own type in the name.

## 25. Pluggable Behaviour Over Subclass Explosion

When many subclasses differ in only one or two methods, replace the hierarchy with a single class that accepts a strategy (callback, lambda, or strategy object). Reserve subclassing for genuinely different families of behaviour.

## 26. Collecting Parameter

When multiple sub-methods need to contribute to a single result collection, pass the collection as a parameter rather than concatenating return values or stashing state in a field.

## 27. Interesting Return Values Only

A method should return a value only when the caller needs it. Do not return `self` or internal state by default—return something meaningful or nothing at all. Make return values intentional.

## 28. Reversing Method for Readable Flow

If sending messages to multiple receivers in sequence breaks readability, add a convenience method on the parameter so all calls flow through one object. Readable left-to-right flow matters.

## 29. Debug Printing for Developer Ergonomics

Override `toString`/`__repr__`/`inspect` to show the structural information a developer needs when debugging. User-facing display strings are a separate concern.

## 30. Adopt Patterns Incrementally

Do not try to apply all rules at once. Write code, notice friction, then apply the pattern that resolves it. Patterns are refactoring targets, not upfront mandates. Clean up as you go.

---

## How to use this file

Use it for code review, pairing, and AI-assisted development. Reference a principle by number (for example, "Principle 8: name after the concept, not the algorithm"). This file is the canonical list; [`AGENTS.md`](../../../AGENTS.md) defines project-specific rules and agent roles.
