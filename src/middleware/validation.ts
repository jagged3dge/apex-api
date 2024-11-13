import { Request, Response, NextFunction } from 'express'
import { isValid, parseISO } from 'date-fns'

export const validateDateQuery = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { week } = req.query

  if (!week || typeof week !== 'string') {
    return res
      .status(400)
      .json({ error: 'Week parameter is required (YYYY-MM-DD format)' })
  }

  if (!isValid(parseISO(week))) {
    return res.status(400).json({ error: 'Invalid date format' })
  }

  next()
}
