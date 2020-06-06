const enum Precedence {
  PrecNone,
  PrecAssignment,
  PrecOr,
  PrecAnd,
  PrecEquality,
  PrecComparison,
  PrecTerm,
  PrecFactor,
  PrecUnary,
  PrecCall,
  PrecPrimary,
}

export default Precedence;
